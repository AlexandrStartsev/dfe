Array.isArray = function(o) { return o instanceof Array }
Array.prototype.forEach = function(f, a) { for(var i = 0; i < this.length; i++) f.call(a, this[i], i, this) }
Array.prototype.indexOf = function(e) { var i=this.length-1; for(;i>=0 && this[i] != e;i--); return i; }
Array.prototype.filter = function(f, a) { var r=[],i; for(i=0; i < this.length; i++) f.call(a, this[i], i, this) && r.push(this[i]); return r }
Array.prototype.map = function(f, a) { var r=[],i; for(i=0; i < this.length; i++) r.push(f.call(a, this[i], i, this)); return r }
Array.from = function(s) { 
    var r = [], o;
    typeof s[Symbol.iterator] === 'function' && (s = s[Symbol.iterator]());
    if(typeof s.next === 'function') 
        while(!(o=s.next()).done) 
            r.push(o.value); 
    else 
        s.forEach(function(e) { r.push(e); } ); 
    return r; 
}

var Symbol = function(){}
Symbol.iterator = 'Symbol(Symbol.iterator)';
Symbol.toStringTag = 'Symbol(Symbol.toStringTag)';
 
var Set = Java.type('com.arrow.util.nashorn.collections.NashornSet'); 
var Map = Java.type('com.arrow.util.nashorn.collections.NashornMap'); 

Set.prototype.constructor = Set;
Map.prototype.constructor = Map;

var WeakMap = (function(){
	var JavaWeakMap = Java.type('java.util.WeakHashMap');
	
	var WeakMap = function() {
		this.__impl = new JavaWeakMap();
	}
	WeakMap.prototype.get = function(key) { return this.__impl.get(key); }
	WeakMap.prototype.set = function(key, value) { return this.__impl.put(key, value); }
	return WeakMap;
})()

//########################################################################################

/** 
 *  console polyfill
 */

var console = (function(){
    var timeMap = new Map();
    var System = Java.type('java.lang.System');
    var JavaException = Java.type('java.lang.Exception');
    function format(a) {
        if(a instanceof Error) {
            return a.message + '\n' + a.stack;
        }
        switch(typeof a) {
        case 'function':
            return a.toString();
        case 'number':
        case 'boolean':
        case 'string':
            return a;
        case 'object':
            try {
            	if(a && typeof a[Symbol.toStringTag] === 'function') return a[Symbol.toStringTag]();
                return JSON.stringify(a) || new String(a);
            } catch(a) {
                return new String(a);
            }
        default:
            return new String(a);
        }
    }
    function doLog(object, dest, prefix) {
        if( object instanceof JavaException ) {
            object.printStackTrace(dest);
        } else {
            dest.println((prefix||'') + format(object))
        }
    }
    return {
        log : function () {
            for(var i = 0; i < arguments.length; i++) {
                doLog(arguments[i], System.out);
            }
        },
        warn : function (a, e) {
            for(var i = 0; i < arguments.length; i++)
                doLog(arguments[i], System.err, 'WARN: ');
        },
        error : function (a) {
            for(var i = 0; i < arguments.length; i++) {
                doLog(arguments[i], System.err, 'ERROR: ');
            }
        },
        alert : function (a, e) {
            for(var i = 0; i < arguments.length; i++)
                doLog(arguments[i], System.err, 'ALERT: ');
        },
        time : function(s) {
            timeMap.set(s, System.currentTimeMillis())
        },
        timeEnd : function(s) {
            this.log(s + ": " + (System.currentTimeMillis() - timeMap.get(s)) + "ms" );
            timeMap.delete(s);
        }
    }
})();

var alert = console.alert;

/**
 * Event loop with thread context. All events will be executed within the same thread thus will remain thread-safe.
 * Some event suppliers (non-blocking feeder and http calls) will run in separate threads managed by externally supplied executor services. 
 * 
 * Eventloop will automatically shutdown if event supply is exhausted because there is no way to supply new events unless through other events.
 *   
 * Eventloop will generally respond to thread interruption with shutdown, it will release non-blocking feeder threads in this case,
 * so no need to do it manually. It will not shutdown supplied non-blocking executor services so they can be reused.
 * It will not close async http client.
 *    
 * non-blocking feeder is expected to shutdown by interrupting its thread. non-blocking feeder thread is interrupted externally,
 * its resources will be released from event loop. Eventloop will not shutdown in this case.     
 */

var global = (function() {return this})();

function EventLoop(rootTask, localhostAddress, httpClient){
	var JavaInterruptedException = Java.type('java.lang.InterruptedException');
	var JavaConcurrentHashMap = Java.type('java.util.concurrent.ConcurrentHashMap');
	var JavaLinkedBlockingQueue = Java.type('java.util.concurrent.LinkedBlockingQueue');
	var JavaTimer = Java.type('java.util.Timer');
	var JavaTimerTask = Java.type('java.util.TimerTask');
	var JavaException = Java.type('java.lang.Exception');

	var makeJavaException = (function(){
		return function (message, e) {
			if(typeof message !== 'string') {
				e = message;
				message = undefined;
			}
			var javaException = new JavaException(e.stack ?  e.toString() + '\n' +  e.stack : e);
			return message ? new JavaException(message, javaException) : javaException;
		}
	})();

	function wrapJavaException(e) {
		if(e instanceof JavaException) {
			return new Error(e.getMessage());
		}
		return e;
	}
	
	function argsToArray(args, initialIndex, out) {
		var params = out||[];
		for(var i = initialIndex||0; i < args.length; i++) {
			params.push(args[i]);
		}
		return params;
	}
	
	var isDebugMode = typeof __EVENTLOOP_DEBUG_MODE__ !== 'undefined' && __EVENTLOOP_DEBUG_MODE__;

//	var threadContext_name = '__threadContext__' + JavaThread.currentThread().getName();
	var threadContext_counter = 0;
	var threadContext_breakpoint = 0;
	var threadContext_currentTask = null; 
	var threadContext_eventQueue = new JavaLinkedBlockingQueue();
	var threadContext_timer = new JavaTimer();
	var threadContext_pendingTasks = new JavaConcurrentHashMap();
	var interrupted = false;

	// When enabling parent tracking, make sure following doesn't blow up or do something about it: function DoLoad(v, callback) {v ? setImmediate(DoLoad.bind(null, v-1, callback)) : callback();} function Do(x) {	if(x < 100000) {		console.time("" + x);		DoLoad(10000, function() {			console.timeEnd("" + x);			Do(x + 1);		});	}};Do(0);
	function prepareTask(type, oncancel) {
		var once = type !== 'interval', task = {
			id: threadContext_counter++,
			breakpoint: (threadContext_currentTask ? threadContext_currentTask.breakpoint : 0),
			//depth: (threadContext_currentTask ? threadContext_currentTask.depth : 0) + 1,
			type: type,
			status: 'scheduled',
			submit: function(body) {
				try {
					threadContext_eventQueue.put(function() {
						(once || task.status === 'cancelled') && threadContext_pendingTasks.remove(task.id);
						if(task.status === 'scheduled') {
							try {
								threadContext_currentTask = task;
								body();
							} catch (e) {
								console.log(e);
								console.error('Scheduled task [' + type + '] threw exception:', e, "Task creation path: ", task.stack);
							} finally {
								once && (task.status = 'done');
							}
						}
					});
				} catch(e) {
					if(e instanceof JavaInterruptedException) interrupted = true;
				}
			},
			cancel: function() {
				if(task.status !== 'cancelled') {
                    task.status = 'cancelled';
                    threadContext_pendingTasks.remove(task.id);
                    typeof oncancel === 'function' && oncancel(task);
				}
			},
			stack: isDebugMode && new String(new Error().stack).replace(/Error/, "task creation stack trace for: ")
		}
		threadContext_pendingTasks.put(task.id, task);
		return task;
	}
	
	function cancelTaskTree(breakpoint) {
		threadContext_pendingTasks.forEach(function(_, task){
			if(task.breakpoint === breakpoint) {
				//task.type === 'promise' && console.log(task.__traceStatus());
				task.cancel();
			}
		});
	}
	
	function setBreakpoint() {
		return threadContext_currentTask.breakpoint = ++threadContext_breakpoint;
	}

	function showPendingTasks() {
		console.warn("*** Pending tasks snapshot ***");
		threadContext_pendingTasks.forEach(function(_, task){
			console.warn('[' + task.id + '] ' + task.type + ' <' + task.status + '> ' + task.stack);
		});
		console.warn("******************************")
	}
	
	function nonBlockingFeeder(asyncSupplier, syncConsumer, executorService) {
		isDebugMode && console.log("Starting new non-blocking feeder");
		var managed = !executorService;
		managed && (executorService = Java.type("java.util.concurrent.Executors").newSingleThreadExecutor());
		var thread, task = prepareTask('interval', function() { isDebugMode && console.log("Non-blocking feeder shutdown requested"); managed ? executorService.shutdownNow() : thread.interrupt() });
		executorService.execute(function() {
			thread = Java.type('java.lang.Thread').currentThread();
			while(true) {
				try {
					task.submit(syncConsumer.bind(null, asyncSupplier()));
				} catch(e) {
					if(e instanceof JavaInterruptedException || interrupted) break ;
				}
			}
			task.cancel();
			isDebugMode && console.log("Non-blocking feeder shutdown complete");
		});
	}
	
	function run() {
		try {
			isDebugMode && console.log("Eventloop started");
			setImmediate(
				function(){
					rootTask({
						setBreakpoint: setBreakpoint,
						cancelTaskTree: cancelTaskTree,
						nonBlockingFeeder: nonBlockingFeeder
					})
				}
			);
			while(!interrupted && threadContext_pendingTasks.size() > 0) {
				try {
					threadContext_eventQueue.take()();
				} catch(e) {
					if(e instanceof JavaInterruptedException ) {
						interrupted = true;
					} else {
						console.error("Event threw exception - it is likely API issue", e);
					}
				}
			}
		} catch (e) {
			console.warn('Exception in event loop', e);
			throw e;
		} finally {
			interrupted && threadContext_pendingTasks.forEach(function(_, task){ if(task.status !== "cancelled") try { task.cancel(); } catch(e) { console.warn("Failed to cancel task " + task.id) }});
			if(isDebugMode ) {
				interrupted && showPendingTasks();
				console.log("Eventloop finished. Cleaning up");
			}
			threadContext_timer.cancel();
			threadContext_pendingTasks.clear();
			threadContext_eventQueue.drainTo([]);
			threadContext_eventQueue = null;			
		}
	}	

	global.setTimeout = function(callback, delay) { //...arguments
		var task = prepareTask('timeout', function(t) { t.timerTask && (t.timerTask.cancel(), t.timerTask = null) });
		task.timerTask = new (Java.extend(JavaTimerTask, {
		    run: function() {
		    	task.submit(function() { callback.apply(arguments[2], argsToArray(arguments, 3)) });
		    }
		}))();
		threadContext_timer.schedule(task.timerTask, delay);
		return task;
	}

	global.setInterval = function(callback, delay) { //...arguments
		var task = prepareTask('interval', function(t) { t.timerTask && (t.timerTask.cancel(), t.timerTask = null) });
		task.timerTask = new (Java.extend(JavaTimerTask, {
		    run: function() {
		    	task.submit(function() { callback.apply(arguments[2], argsToArray(arguments, 3)) });
		    }
		}))();	
		threadContext_timer.scheduleAtFixedRate(task.timerTask, delay, delay);
		return task;
	}

	global.clearInterval = global.clearTimeout = function(task) { // EventLoop.isRunning() &&
		task && task.cancel();
	}

	global.setImmediate = function(callback) { //...arguments
		var task = prepareTask('immediate');
		task.submit(function() { callback.apply(arguments[1]||null, argsToArray(arguments, 2)) });
		return task;
	}

	global.XMLHttpRequest = (function(){
		var JavaResponse = Java.type('org.asynchttpclient.Response');
		var JavaDsl = Java.type('org.asynchttpclient.Dsl');
		var counter = 0;
		
		return function () {
			var _this = this, impl = {
				schedule: [],
				requestBuilder: null,
				httpResponse: undefined,
				readyState: 0,
				status: 0,
				statusText: 'Not sent',
				responseText: undefined,
				url: undefined
			}, instance = counter++;
			Object.defineProperties(this, {
				onreadystatechange: { 
					set: function( callback ) {  // callback.call(this);
						if( impl.submitState === 4 )
							callback.call(_this);
						else 
							impl.schedule.push(callback);
					},
					enumerable: false
				},
				readyState: {
					get: function() {
						return impl.submitState
					},
					enumerable: true
				},
				status: {
					get: function() {
						return impl.status
					},
					enumerable: true
				},			
				statusText: {
					get: function() {
						return impl.status
					},
					enumerable: true
				},
				response: {
					value: null,
					enumerable: true
				},
				responseText: {
					get: function() {
						return impl.responseText
					},
					enumerable: true
				}
			});
			function handleChangeState(newState) {
				try {
					impl.submitState = newState;
					impl.schedule.forEach(function(callback){
						callback.call(_this);
					})
				} catch (resp) {
					console.error("Unhandled exception in onreadystatechange", resp);
				}
			}
			function handleExecutionComplete() {
				try {
					if( impl.httpResponse instanceof JavaResponse ) {
						var resp = impl.httpResponse;
						impl.responseText = resp.getResponseBody();
						impl.status = resp.getStatusCode();
						impl.statusText = resp.getStatusText();
					} else {
						impl.status = -1;
						impl.responseText = impl.statusText = 'ERROR: ' + impl.httpResponse.message;
					}
					handleChangeState(4);
					impl.schedule = null;
				} catch (resp) {
					impl.httpResponse = resp;
					handleExecutionComplete();
				}
			}		
			this.open = function(method, url) {
				try {
					impl.url = url.match(/^http[s]?\:/) ? url : localhostAddress + url;
					isDebugMode && console.log("Nashorn XMLHttpRequest @" + instance + " open connection to " + impl.url);
					impl.requestBuilder = JavaDsl.request(method, impl.url);
					handleChangeState(1);
				} catch(e) {
					throw wrapJavaException(e); 
				}
			}
			this.setRequestHeader = function(name, value) {
				impl.requestBuilder.addHeader(name, value);
			}
			this.send = function(payload) {
				var request = impl.requestBuilder.setBody(payload === null || payload === undefined ? "" : typeof payload === 'string' ? payload : JSON.stringify(payload)).build();
				var task = prepareTask('httprequest', function() {
					task.future && (task.future.abort(new JavaException("Request has been cancelled by EventLoop API")), console.warn("httprequest task cancelled"));
				});
				try {
					(task.future = httpClient.executeRequest(request)).toCompletableFuture().handle(function(response, exception) {
						task.future = null;
						impl.httpResponse = response||exception;
						isDebugMode && console.log("Nashorn XMLHttpRequest @" + instance + " got result: " + (response && response.getStatusCode()));
						task.submit(handleExecutionComplete);
					});
				} catch(exception) {
        			if( e instanceof JavaInterruptedException ) {
        				interrupted = true;
        				return ;
        			}
					task.cancel();
					throw wrapJavaException(exception); 
				}
				handleChangeState(2);
			}
		}
	})();

	global.Promise = (function() {
		var JavaCompletableFuture = Java.type('java.util.concurrent.CompletableFuture');
		var STATUS_RESOLVED = "resolved", STATUS_REJECTED = "rejected";
	    var Promise = function(biConsumer) {
	    	var _status = "pending", impl = new JavaCompletableFuture(); //, stack = isDebugMode && new Error().stack, breakpoint = threadContext_currentTask.breakpoint;
	        function followup(status, value) {
	        	if(value && typeof value.then === 'function') {
	        		value.then(followup.bind(null, STATUS_RESOLVED), followup.bind(null, STATUS_REJECTED));
	        	} else {
	        		impl.complete({ status: _status = status, value: value });
	        	}
			}
	        
	        this.then = function(onResolve, onReject) {
				return new Promise(function(resolve, reject){
		        	var task = prepareTask('promise', function() { _status === "pending" && followup(STATUS_REJECTED, new Error("Promise has been cancelled by EventLoop API")) });
					impl.thenAccept(function(obj) {
						var ok = obj.status === STATUS_RESOLVED;
		            	task.submit(function() {
		            		try {
		            			var f1 = ok ? onResolve : onReject;
		            			(ok ? resolve : reject)(typeof f1 === 'function' ? f1(obj.value) : undefined);
		            		} catch(e) {
		            			if( e instanceof JavaInterruptedException ) {
		            				interrupted = true;
		            				return ;
		            			}
		            			console.warn('Uncaught exception in promise handler', e);
		            			reject(e);
		            		}
		            	})
		            })
				})
			}
	        
			this.catch = function(onReject) {
				this.then(null, onReject);
			}

			this[Symbol.toStringTag] = function() {
				return "Promise { < " + _status + " > }";
			}

			try {
			    biConsumer(followup.bind(null, STATUS_RESOLVED), followup.bind(null, STATUS_REJECTED));
			} catch (e) {
				if( e instanceof JavaInterruptedException ) {
					interrupted = true;
					return ;
				}
				console.warn('Unhandled exception in promise body', e);
				followup(STATUS_REJECTED, e);
			}
			
		}
		
		Promise.all = function(promises) {
			return new Promise(function(resolve, reject){
				var all = [], toGo = promises.length, rejected = 0;
				if(toGo === 0){
	                resolve([]);
				}
				promises.forEach(function(promise, i){
	        		promise.then(function(value){
						all[i] = value;
						--toGo || resolve(all);
					}, function(error) {
						rejected++ || reject(error);
					})
				})
			})
		}
		Promise.race = function(promises) {
			return new Promise(function(resolve, reject){
				var done = 0;
				if(promises.length === 0){
	                resolve([]);
				}
				promises.forEach(function(promise){
	                promise.then(function(value){
						done++ || resolve(value);						
					}, function(error) {
						done++ || reject(error);
					})
				})
			});
		}
		Promise.resolve = function(value) {
			//if(value && typeof value.then === 'function') return value; 
			return new Promise(function(resolve) {
				resolve(value);
			})
		}
		Promise.reject = function(value) {
			return new Promise(function(resolve) {
				reject(value);
			})
		}
		return Promise;
	})()
	
	//=========main function===========
	run();
}
	
var require = (function(s) {
	var JavaIOUtils = Java.type('org.apache.commons.io.IOUtils');
	var classLoader = Java.type('java.lang.Thread').currentThread().getContextClassLoader();
	var JavaURL = Java.type('java.net.URL');
	
	function getAsText(uri) {
		try {
	        var cpRegEx = /^classpath:/;
	        return JavaIOUtils.toString( uri.match(cpRegEx) ?  classLoader.getResourceAsStream(uri.replace(cpRegEx, '')) : new JavaURL(uri).openStream(), "UTF-8" );
		} catch(e) {
			console.error("error loading uri " + uri);
			throw e;
		}
	}
	
	return function(uri) {
		console.log("Nashorn is loading module: " + uri);
		var _bkp = typeof module === 'object' ? module : null;
		module = {exports: {}};
		exports = module.exports;
		load({name: uri, script: getAsText(s + uri)});
		var ret = module.exports;
		if(_bkp) {
			exports = (module = bkp).exports;
		} else {
			delete this.module;
			delete this.exports;
		}
		return ret;
	}
})(__STATIC_ROOT__)