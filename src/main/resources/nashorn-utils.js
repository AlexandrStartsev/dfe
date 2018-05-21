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

var Symbol = {iterator: 'Symbol(Symbol.iterator)'};
 
var Set = Java.type('com.arrow.util.nashorn.collections.NashornSet'); 
var Map = Java.type('com.arrow.util.nashorn.collections.NashornMap'); 

Set.prototype.constructor = Set;
Map.prototype.constructor = Map;

var JavaCompletableFuture = Java.type('java.util.concurrent.CompletableFuture');
var JavaConcurrentHashMap = Java.type('java.util.concurrent.ConcurrentHashMap');
var JavaAtomicInteger = Java.type('java.util.concurrent.atomic.AtomicInteger');
var JavaTimeUnit = Java.type('java.util.concurrent.TimeUnit');
var JavaThread = Java.type('java.lang.Thread');
var JavaThreadLocal = Java.type('java.lang.ThreadLocal');
var JavaLinkedBlockingQueue = Java.type('java.util.concurrent.LinkedBlockingQueue');
var JavaTimer = Java.type('java.util.Timer');
var JavaTimerTask = Java.type('java.util.TimerTask');
var JavaException = Java.type('java.lang.Exception');
var JavaExecutors = Java.type('java.util.concurrent.Executors');
var JavaRunnable = Java.type('java.lang.Runnable');
var JavaCallable = Java.type('java.util.concurrent.Callable');
var JavaTimeoutException = Java.type('java.util.concurrent.TimeoutException');
var JavaIOUtils = Java.type('org.apache.commons.io.IOUtils');
var JavaURL = Java.type('java.net.URL');
var JavaCacheHandler = Java.type('com.arrow.util.nashorn.CacheHandler');
var classLoader = JavaThread.currentThread().getContextClassLoader();


var makeJavaException = (function(){
	var JavaException = Java.type('java.lang.Exception');
	return function (message, e) {
		if(typeof message !== 'string') {
			e = message;
			message = undefined;
		}
		var javaException = new JavaException(e.stack ?  e.toString() + '\n' +  e.stack : e);
		return message ? new JavaException(message, javaException) : javaException;
	}
})();

//########################################################################################

/** 
 *  console polyfill
 */

var console = (function(){
    var timeMap = JavaThreadLocal.withInitial(function() { return new Map()});
    var System = Java.type('java.lang.System');
    function format(a) {
        if(a instanceof Error) {
            return a.message + '\n' + a.stack;
        }
        switch(typeof a) {
        case 'undefined':
            return 'undefined';
        case 'function':
            return a.toString();
        case 'number':
        case 'boolean':
        case 'string':
            return a;
        case 'object':
            try {
                return JSON.stringify(a);
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
            timeMap.get().set(s, System.currentTimeMillis())
        },
        timeEnd : function(s) {
            this.log(s + ": " + (System.currentTimeMillis() - timeMap.get().get(s)) + "ms" );
            timeMap.get().delete(s);
        }
    }
})();

var alert = console.alert;

/**
 * Event loop with thread context. All "user" code will be executed with a single thread thus will remain thread-safe;  
 */

var non_event_loop_executor = JavaExecutors.newCachedThreadPool();

function executeAsync(task, eventLoopContext) {
	eventLoopContext ? eventLoopContext.supplyAsync(task) : non_event_loop_executor.submit(new (Java.extend(JavaRunnable, { run: task })));
}


function argsToArray(args, initialIndex, out) {
	var params = out||[];
	for(var i = initialIndex||0; i < args.length; i++) {
		params.push(args[i]);
	}
	return params;
}

var EventLoop = (function(){
	var threadContext = new JavaThreadLocal();
	var isDebugMode = typeof __EVENTLOOP_DEBUG_MODE__ !== 'undefined' && __EVENTLOOP_DEBUG_MODE__;

	function newEventLoopContext(httpServletRequest) {
		var name = '__threadContext__' + JavaThread.currentThread().getName();
		//console.log('Starting event loop: ' + name);
		return {
			name: name, 
			executor: JavaExecutors.newCachedThreadPool(),
			httpServletRequest: httpServletRequest,
			counter: new JavaAtomicInteger(0),
			eventQueue: new JavaLinkedBlockingQueue(),
			timer: new JavaTimer(),
			pendingTasks: new JavaConcurrentHashMap(),
			supplyAsync: function(callable) {
				return JavaCompletableFuture.supplyAsync( callable, this.executor );
			},
			exceptions: new Set()
		}
	}

	function shutdownEventLoopContext(context, result) {
		if(typeof result !== 'undefined') {
			context.result = result;
		}			
		if(!context.executor.isShutdown()) {
			context.timer.cancel();
			context.executor.shutdown();
			context.pendingTasks.clear();
			context.eventQueue.drainTo([]);
			context.eventQueue = null;
		}
	}

	function createQueueTaskInContext(context, callback, type, _this, parameters) {
		var once = type !== 'interval', task = {
			id: context.counter.incrementAndGet(),
			execute: function(args) { // array
				once && context.pendingTasks.remove(task.id);
				if(task.status === 'scheduled') {
					try {
						task.result = callback.apply(_this, parameters||args);
					} catch (e) {
						task.result = e;
						console.error('Scheduled task [' + type + '] threw exception:', e);
						context.exceptions.add(e);
					} finally {
						typeof task.callback === 'function' &&  task.callback(task.result);
						once && (task.status = 'done');
					}
				}
			},
			type: type,
			status: 'scheduled',
			perform: function() {
				context.eventQueue.put({task: task, args: argsToArray(arguments)})
			},
			debugInfo: isDebugMode && makeDebugInfo(callback, _this, parameters)   
		}
		context.pendingTasks.put(task.id, task);
		return task;
	}
	
	function cancelQueueTask(task) {
		task.status = 'cancelled';
		threadContext.get().pendingTasks.remove(task.id);
	}

	function executeNextTask() {
		var context = threadContext.get();
		if(context.pendingTasks.size() > 0) {
			var job = context.eventQueue.take();
			var value = job.task.execute.call(null, job.args);
			return true ;
		}
	}
	
	function run(rootTask, durationLimit, httpServletRequest, exitLoopIf) { 
		if(typeof durationLimit !== 'number' || durationLimit <= 0) {
			durationLimit = 10*1000;
		}
		var System = Java.type('java.lang.System');
		var context = newEventLoopContext(httpServletRequest);
		var mainThreadResult, mainThreadException;
		try {
			context.supplyAsync(function(){
				threadContext.set(context);
				setImmediate(function(){
					var rootResult = rootTask.apply(context, argsToArray(arguments, 2));
					if( typeof context.result === 'undefined' ) {
						context.result = rootResult;
					}
				})
				while( !(typeof exitLoopIf === 'function' && exitLoopIf()) && executeNextTask() );
			}).get(durationLimit, JavaTimeUnit.MILLISECONDS);
		} catch (e) {
			if( e instanceof JavaTimeoutException ) {
				console.warn('event loop timed out');
				if(isDebugMode) {
					console.warn("*** Pending tasks snapshot ***")
					takePendingTasksSnapshot(context).forEach(function(task) {
						console.warn('[' + task.id + '] ' + task.type + ' ' + task.status, task.debugInfo.stack);
					})
					console.warn("******************************")
			    }
			} else {
				console.warn('exception in event loop', e);
			}
			return e;
		} finally {
			shutdownEventLoopContext(context);
			return context.result;
		}
	}
	
    function makeDebugInfo(callback, _this, parameters) {
		return {
			callback: typeof callback === 'function' && callback.toString(),
			targetClass: typeof _this === 'object' && _this !== null && _this.constructor.name,
			stack: new Error().stack,
			parameters: Array.isArray(parameters) && parameters.slice()
		}
	}

	function takePendingTasksSnapshot(context) {
		try {
			var tasks = [];
			context.pendingTasks.forEach(function(_, task){
				tasks.push({id: task.id, type: task.type, status: task.status, debugInfo: task.debugInfo});
			})
		} catch(e) {
			console.error(e);
		}
		return tasks;
	}

	return {
		createQueueTask: function(callback, type, _this, parameters) {
			return createQueueTaskInContext(threadContext.get(), callback, type, _this, parameters)
		},
		cancelQueueTask: cancelQueueTask,
		run: run,
		isRunning: function() {
			var tx = threadContext.get();
			return tx !== null && tx.eventQueue !== null;
		},
		shutdown: function(result) {
			return shutdownEventLoopContext(threadContext.get(), result);
		},
		getTimer: function () {
			return threadContext.get().timer
		},
		supplyAsync: function(task) {
			return threadContext.get().supplyAsync(task);
		},
		__debugContextName: function() {
			return threadContext.get().name;
		},
		getContext: function() {
			return threadContext.get()
		},
		setContext: function(context) {
			if(threadContext.get() !== null && context !== null) {
				throw 'Unable to set context - already in event loop';
			}
			threadContext.set(context)
		},
		takePendingTasksSnapshot: takePendingTasksSnapshot,
		hasPendingNonTimerEvents: function() {
			return threadContext.get().pendingTasks.values().stream().anyMatch(function(task) { return task.type != 'interval' && task.type != 'timeout' });
		}
	}
})( )

function setTimeout(callback, delay) { //...arguments
	if(EventLoop.isRunning()) {
		var task = EventLoop.createQueueTask(callback, 'timeout', null, argsToArray(arguments, 2));
		var timerTask = new (Java.extend(JavaTimerTask, {
		    run: function() {
		    	task.perform();
		    }
		}))();
		EventLoop.getTimer().schedule(timerTask, delay);
		return {task: task, timerTask: timerTask};
	} else {
		callback.apply(null, argsToArray(arguments, 2));
	}
}

function setInterval(callback, delay) { //...arguments
	if(EventLoop.isRunning()) {
		var task = EventLoop.createQueueTask(callback, 'interval', null, argsToArray(arguments, 2));
		var timerTask = new (Java.extend(JavaTimerTask, {
		    run: function() {
		    	task.perform();
		    }
		}))();
		EventLoop.getTimer().scheduleAtFixedRate(timerTask, delay, delay);
		return {task: task, timerTask: timerTask};
	}
}

function clearTimeout(tt) {
	if(EventLoop.isRunning() && typeof tt !== 'undefined' ) {
		tt.timerTask.cancel();
		EventLoop.cancelQueueTask(tt.task);
	}
}

function clearInterval(tt) {
	clearTimeout(tt);
}

function setImmediate(callback) { //...arguments
	if(EventLoop.isRunning()) {
		EventLoop.createQueueTask(callback, 'immediate', null, argsToArray(arguments, 1)).perform();
	} else {
		callback.apply(null, argsToArray(arguments, 1));
	}
}

var XMLHttpRequest = (function(hostAddress){
	var JavaDefaultHttpClient = Java.type('org.apache.http.impl.client.DefaultHttpClient');
	var JavaHttpGet = Java.type('org.apache.http.client.methods.HttpGet');
	var JavaHttpPost = Java.type('org.apache.http.client.methods.HttpPost');
	var JavaStringEntity = Java.type('org.apache.http.entity.StringEntity');
	var JavaHttpResponse = Java.type('org.apache.http.HttpResponse');
	var JavaEntityUtils = Java.type('org.apache.http.util.EntityUtils');
	var JavaBasicHttpContext = Java.type('org.apache.http.protocol.BasicHttpContext');
	var JavaPoolingClientConnectionManager = Java.type('org.apache.http.impl.conn.PoolingClientConnectionManager');
	var commonClient = new JavaDefaultHttpClient(new JavaPoolingClientConnectionManager());
	
	return function () {
		var _this = this, impl = {
			schedule: [],
			client: commonClient, //new JavaDefaultHttpClient(), 
			request: null,
			httpResponse: undefined,
			readyState: 0,
			status: 0,
			statusText: 'Not sent',
			responseText: undefined,
			url: undefined
		}
		Object.defineProperties(this, {
			onreadystatechange: { 
				set: function( callback ) {  // callback.call(this);
					if( impl.readyState === 4 )
						callback.call(_this);
					else 
						impl.schedule.push(callback);
				},
				enumerable: false
			},
			readyState: {
				get: function() {
					return impl.readyState
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
			impl.readyState = newState;
			impl.schedule.forEach(function(callback){
				callback.call(_this);
			})
		}
		function handleExecutionComplete() {
			try {
				if( impl.httpResponse instanceof JavaHttpResponse ) {
					var resp = impl.httpResponse;
					var entity = resp.getEntity();
					impl.responseText = entity == null ? 'null' : JavaEntityUtils.toString(entity); 
					impl.status = resp.getStatusLine().getStatusCode();
					impl.statusText = resp.getStatusLine().getReasonPhrase();
					//impl.httpResponse.close();
				} else {
					var resp = impl.httpResponse;
					impl.status = -1; // ? 
					impl.statusText = 'ERROR: ' + resp instanceof JavaException ? resp.getMessage() : resp instanceof Error ? resp.message : JSON.stringify(resp);
				}
				handleChangeState(4);
				impl.schedule = null;
			} catch (e) {
				impl.httpResponse = e;
				handleChangeState(4);
			} finally {
				//impl.client.close();
			}
		}		
		this.setRequestHeader = function(name, value) {
			impl.request.setHeader(name, value);
		}
		this.open = function(method, url) {
			impl.url = url.match(/^http[s]?\:/) ? url : hostAddress + url;
			try {
				switch(method) {
				case 'GET':
					impl.request = new JavaHttpGet(impl.url);
					break ;
				case 'POST':
					impl.request = new JavaHttpPost(impl.url);
					break ;
				default:
					throw 'Unsupported';
				}
				handleChangeState(1);
			} catch ( e ) {
				impl.httpResponse = e;
				handleExecutionComplete();
			}
		}
		this.send = function(payload) {
			if(impl.request instanceof JavaHttpPost) {
			switch(typeof payload) {
				case 'string':
					impl.request.setEntity(new JavaStringEntity(payload));
					break ;
				case 'object':
					impl.request.setEntity(new JavaStringEntity(JSON.stringify(payload)));
					break ;
				default:
					// no op
				}
			}
			var task = EventLoop.createQueueTask(handleExecutionComplete, 'httprequest');
			/** 
			 * Alex: if code below fails, and future isn't scheduled, pending task will remain and eventloop will "hang" until timeout.
			 * this doens't include async body (impl.client.execute...) - just supplyAsync / handl themselves, 
			 * so i don't think catch / cleanup are necessary. But keep an eye on this code. If things start acting up, check here first.  
			 */
			var future = EventLoop.supplyAsync(function() {
				var response = impl.client.execute(impl.request, new JavaBasicHttpContext()); // TODO: populate credentials and other stuff from  context::httpServletRequest
				return response;
			});
			future.handle(function(response, exception) {
				impl.httpResponse = response||exception;
				task.perform();
			})
			impl.worker = { task : task, future: future }
			handleChangeState(2);
		}		
	}
})(__AJAX_ROOT__);

/**
 *  Promise polyfill -- based on setImmediate/ setTimeout. As-is browser polyfill copy
 */

var Promise = (function() {
	var counter = new JavaAtomicInteger();
    var Promise = function(biConsumer) {
		var impl = new JavaCompletableFuture();
        function followup(status, value) {
			impl.complete({ status: status, value: value });
		}
        function thenImpl(resolve, reject) {
			var task = EventLoop.createQueueTask(function(obj){
				(obj.status === 1 ? resolve : reject )(obj.value);
			}, 'promise');
            impl.thenAccept( task.perform.bind(task) );
		}
		this.then = function(onResolve, onReject) {
			return new Promise(function(resolve, reject){
                thenImpl(function(_value){
					try {
                        resolve(typeof onResolve === 'function' ? onResolve(_value) : undefined);  
					} catch (e) {
						console.warn('Uncaught exception in promise(resolve)', e);
						reject(e);
					}
				}, function(_value){
					try {
                        reject(typeof onReject === 'function' ? onReject(_value) : undefined);
					} catch (e) {
						console.warn('Uncaught exception in promise(reject)', e);
						reject(e);
					}
				});
			})
		}
		this.catch = function(onReject) {
			this.then(null, onReject);
		}

		try {
		    biConsumer(followup.bind(this, 1), followup.bind(this, -1));
		} catch (e) {
			console.warn('Unhandled exception in promise body', e);
			followup(-1, e);
		}
	}
	Promise.all = function(promises) {
		return new Promise(function(resolve, reject){
			var all = [];
			if(promises.length === 0){
                resolve([]);
			}
			promises.forEach(function(promise){
        		promise.then(function(value){
					all.push(value);
					if(all.length === promises.length) {
						resolve(all);
					}
				}, function(error) {
					reject(error);
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

/**
 * Require polyfill 
 */

var require = (function (modules, loadLock, moduleIdx){
	var config = {
        baseUrl: './',
        paths: {},
        bundles: {},
        pkgs: {},
        shim: {},
        config: {},
        map: {},
        translateModuleName: function(moduleName) {
        	var maps = (function flattenMap(map) {
	        	return Array.prototype.concat.apply([], Object.getOwnPropertyNames(map).map(function(id) { 
	        		return typeof map[id] == 'string' ? [{ path: id, module: map[id]}] : flattenMap(map[id]).map(function(tail) { return { path: id + '/' + tail.path, module: tail.module } } ) 
	        	}))
	        })(this.map).map(function(row) { 
	        	return { weight: row.path.length, regexp: new RegExp('^' + row.path.replace(/\*/g, '.+') + '$'), module: row.module } 
	        }).sort(function(a, b) { return b.weight - a.weight}); // [^/]+
	        for(var i = 0; i < maps.length; i++ ) {
	        	if(moduleName.match(maps[i].regexp))
	        		return maps[i].module;
	        }
	        return moduleName;
        },
        nameToUrl: function (moduleName, ext, skipExt) {
        	var paths, syms, i, parentModule, url, parentPath, bundleId, pkgMain = this.pkgs[moduleName];
	        if (pkgMain) {
	            moduleName = pkgMain;
	        }
	        bundleId = Object.getOwnPropertyNames(this.bundles).filter(
	        	function( id ){ 
	        		return Array.isArray(this.bundles[id]) && this.bundles[id].indexOf(moduleName) > -1 
	        	}, this
	        ).shift();
	        if ( bundleId && bundleId != moduleName ) {
	            return this.nameToUrl(bundleId, ext, skipExt);
	        }
	        
	        if (/^\/|:|\?|\.js$/.test(moduleName)) {
	            url = moduleName + (ext || '');
	        } else {
	            paths = this.paths;
	            syms = moduleName.split('/');
	            for (i = syms.length; i > 0; i -= 1) {
	                parentModule = syms.slice(0, i).join('/');
	                if (parentPath = paths[parentModule]) {
	                    if (Array.isArray(parentPath)) {
	                        parentPath = parentPath[0];
	                    }
	                    syms.splice(0, i, parentPath);
	                    break;
	                }
	            }
	            url = syms.join('/');
	            url += (ext || (/^data\:|^blob\:|\?/.test(url) || skipExt ? '' : '.js'));
	            url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : this.baseUrl) + url;
	        }
	        return this.urlArgs && !/^blob\:/.test(url) ? url + this.urlArgs(moduleName, url) : url;
	    }
	}
	
	function getAsText(uri) {
		try {
	        var cpRegEx = /^classpath:/;
	        return JavaIOUtils.toString( uri.match(cpRegEx) ?  classLoader.getResourceAsStream(uri.replace(cpRegEx, '')) : new JavaURL(uri).openStream(), "UTF-8" );
		} catch(e) {
			console.error("error loading uri " + uri);
			throw e;
		}
	}

	var currentModule = new JavaThreadLocal();
	
	function resolveModuleFutureSync (future, d, eventLoopContext) { 
		eventLoopContext &&	EventLoop.setContext(eventLoopContext);
		try {
			loadModuleSync( d, config.nameToUrl(d) );
			//d.indexOf('forms/') == 0 ? loadFormSync( config.paths.forms, d.replace(/^forms\/|!es5$|!es6$/g,'') ) : loadModuleSync( d, config.nameToUrl(d) );
		} finally {
			eventLoopContext && EventLoop.setContext(null);
		}
	}
	/*
	var loadFormSync = function(formUriBase, formName) {
		loadLock.get(formName, function() {
			var moduleName = 'forms/' + formName;
			var scriptId = moduleName + '!script';
			var scriptName = formUriBase + formName + '.js';
			var transpiledScriptName = formUriBase.replace(/forms/,'forms-transpiled') + formName + '.js';
			console.log('Nashorn loading form "' + formName + '" from ' + scriptName + ' (transpiled file expected at: ' + transpiledScriptName + ')');
			var code = getAsText(scriptName), transpiled;
			currentModule.set(moduleName);
			define(moduleName + '!es6', function() { return code });
			try {
				transpiled = getAsText(transpiledScriptName);
			} catch(e) {
				transpiled = require('babel').transform(code, { plugins: ['transform-es3-property-literals', 'transform-es3-member-expression-literals', 'transform-object-assign', 'transform-object-rest-spread'], presets : ['es2015']}).code;
			}
			define(moduleName + '!es5', function() { return transpiled });
			load({name: transpiledScriptName, script: transpiled} );
			return formName;
		});
	} */
	
	var loadModuleSync = function(moduleName, uri) {
		loadLock.get(uri, function() {
			console.log('Nashorn loading module "' + moduleName + '" from ' + uri);
			currentModule.set(moduleName);			
			load({name: uri, script: getAsText(uri)});
			return uri;
		});
	}
	
	var __noop__ = (function(){
		var dummy = function() { return dummy; }
		dummy.__noSuchProperty__ =dummy;
		dummy.__noSuchMethod__ = dummy;
		return dummy;
	})()

	var requireAsFuture = function (moduleName, module, eventLoopContext) {
		switch(moduleName){
			case 'module': 
				return JavaCompletableFuture.completedFuture(module);
			case 'exports': 
				return JavaCompletableFuture.completedFuture(module.exports);
			case 'require':  
			    return JavaCompletableFuture.completedFuture(require);
			case '__noop__':  
			    return JavaCompletableFuture.completedFuture(__noop__);
			default:
				var translated = config.translateModuleName(moduleName);
				return modules.get(moduleName, function() {
					var future = new JavaCompletableFuture();
					if(translated === moduleName) {
						executeAsync(function(){
							try {
								resolveModuleFutureSync(future, moduleName, eventLoopContext);
							} catch(e) {
								future.completeExceptionally(makeJavaException(e));// throw e;
							}
						}, eventLoopContext)
					} else {
						requireAsFuture(translated).handle(function(v, e) {
							e ? future.completeExceptionally(makeJavaException(e)) : future.complete(v)
						})
					}
					return future;
				});
		}
	}	
	
	function require_el(d, cb, rj, module, eventLoopContext) {
		if(typeof d == 'string') {
			var value = requireAsFuture(d, module, eventLoopContext).getNow(null);
			if(value === null) {
				throw 'Module ' + d + ' has not been loaded yet and can not be fetched in event loop';
			}
			return value;
		}
		if(Array.isArray(d)) {
			var future = new JavaCompletableFuture();
			executeAsync(function(){
				try {
					var futures = d.map( function(i) { return requireAsFuture(i, module, eventLoopContext) } );
					JavaCompletableFuture.allOf( futures ).get(config.waitSeconds, JavaTimeUnit.SECONDS);
					var args = futures.map( function(f) { return f.get() } );
					future.complete(args);
				} catch(e) {
					future.completeExceptionally(makeJavaException(e));// throw e;
				}
			}, eventLoopContext);
			return new Promise(function(resolve, reject) {
				var task = EventLoop.createQueueTask(function(deps, e){
					if( !(e instanceof JavaException || e instanceof Error) ) {
						try {
							resolve(deps);
							return ;
						} catch (ex) {
							e = ex;
						}
					} 
					reject(e);
				}, 'require');
				future.handle(task.perform);
			}).then(function(args) { 
				return typeof cb === 'function' ? cb.apply(null, args) : args
			}, function(e) {
				return typeof rj === 'function' ? rj(e) : (console.warn('Unhandled error while requiring modules', d, e), e)
			});
		}
	}

	function require_non_el(d, cb, rj, module) {
		if(typeof d == 'string') {
			return requireAsFuture(d, module).get(config.waitSeconds, JavaTimeUnit.SECONDS);
		}
		if(Array.isArray(d)) {
			var future = new JavaCompletableFuture();
			executeAsync(function(){
				try {
					JavaCompletableFuture.allOf( d.map( function(i) { return requireAsFuture(i, module) } ) ).get(config.waitSeconds, JavaTimeUnit.SECONDS);
					var args = d.map( function(d) { return require(d, null, null, module) } );
					typeof cb == 'function' && cb.apply(null, args);
					future.complete(args);
				} catch(e) {
					typeof rj == 'function' && rj(e);
					future.completeExceptionally(makeJavaException(e));// throw e;
				}
			});
			return future;
		}
	}
	
	var require = function(d, cb, rj, module) {
		return (EventLoop.getContext() === null ? require_non_el : require_el)(d, cb, rj, module);
	}
	
	var define = function(n, d, cb) {
		if(typeof n != 'string') {
			cb = d;
			d = n;
			n = currentModule.get() || '_anonymous_' + moduleIdx.incrementAndGet();
		}
		var r, exports = {}, module = { id: n, uri: '<unsupported>', config: {}, exports: exports };
		if(!Array.isArray(d) ) { 
			cb = d; 
			d = n === 'require' ? [] : [ 'require', 'exports', 'module' ]; 
		}
		var future = modules.get(n, function() { return new JavaCompletableFuture() });
		require(d, function(){
			future.complete(typeof cb == 'function' && ( cb.apply(exports, arguments) ) || exports || undefined);
		}, function(e) {
			future.completeExceptionally(makeJavaException('Failed to define module ' + n, e));
		}, module);
	}
	
	// This is kind of hax but otherwise it s pretty hard to tell how it will name new module. 
	var makeModuleFromSource = function(code, name, discard) {
		var moduleName = name || '_anonymous_' + moduleIdx.incrementAndGet();
		currentModule.set(moduleName);
		try {
			var future = new JavaCompletableFuture();
			modules.put(moduleName, future);
			load({name: moduleName, script: code});
			return future;
		} finally {
			discard && require.undef(moduleName);
		}
	}
	
	require.config = function(cfg) {
		(function mixin(dest, src) {
			Object.getOwnPropertyNames(src).forEach(function(prop) {
				if( typeof dest[prop] === 'undefined' )
					dest[prop] = src[prop];
				else {
					if( typeof dest[prop] !== typeof src[prop] )
						throw 'Invalid property';
					if( typeof src[prop] === 'string' )
						dest[prop] = src[prop];
					else
						mixin(dest[prop], src[prop]);
				}
			})
		})( config, cfg );
	}

	require.clear = function() { loadLock.clear(); modules.clear(); }
	require.require = require;
	require.define = define;
	require.undef = function(n) { modules.remove(n); }
	require.define.amd = { jQuery: false };
	require.requireAsFuture = requireAsFuture;
	require.makeModuleFromSource = makeModuleFromSource;
	return require;
})(new JavaCacheHandler(), new JavaCacheHandler(), new JavaAtomicInteger());

var define = require.define;

require.config({
	baseUrl: __STATIC_ROOT__ + 'js/core/',
	waitSeconds: 60,
	bundles: {
		'dfe-core' : ['dfe-core', 'core-validation-component' ], 
        'components/generic' : [ 
            'components/base',
            'components/button',
            'components/checkbox',
            'components/child-runtime',
            'components/container',
            'components/div',
            'components/div-button',
            'components/div-c',
            'components/div-r',
            'components/dropdown',
            'components/editbox',
            'components/editbox-money',
            'components/editbox-popup',
            'components/either',
            'components/html',
            'components/html-form',
            'components/iframe',
            'components/inline-rows',
            'components/label',
            'components/labeled',
            'components/labeled-checkbox',
            'components/labeled-component',
            'components/labeled-dropdown',
            'components/labeled-editbox',
            'components/labeled-editbox-money',
            'components/labeled-radiolist',
            'components/modal',
            'components/multioption',
            'components/radiolist',
            'components/span',
            'components/tab-d',
            'components/table',
            'components/tab-s',
            'components/text',
            'components/textarea',
            'components/validation-component'
        ]
	},
	map: {
		ui: {
			'utils' : 'nashorn-ui-utils',
			'*' : '__noop__'
		}
	},
	paths: { 
		forms: __STATIC_ROOT__ + 'js/core/forms/',
		'nashorn-ui-utils': 'classpath:com/arrow/js/nashorn-ui-utils'
	}
})

var validateDfe = (function(){
	function listener(c) {
		return {
	        depend : function () {},
	        notify : function (d, e, a, v) { 
	            if('mard'.indexOf(a) != -1) {
	                console.error('Model is mutating (' + (c && c.field.name) + '):\n' + JSON.stringify(d) + '\n' + e + '\n' + a + '\n' + v );
	                throw new Error('Model is mutating');
	            }
	            return true; 
	        },
	        get : function(data, elem) { return data[elem] },
	        // TODO: this is used to set attribute of subform and it kind of "mutates". Do something about whole thing
	        set : function (data, element, value, action) { if(data[element] != value) { data[element] = value; this.notify(data, element, action, value) }; return true; },
	        For: function(o) { return listener(o); }
		}
	}
	return function (jsonModel, formClass, timeLimit) {
		console.time('Nashorn validation took');
		var Core = require('dfe-core');
		var errors = [], runtime = new Core.Runtime(listener()).setDfeForm(formClass).setModel(JSON.parse(jsonModel));
		var failure = EventLoop.run(function() { runtime.restart(null, 'validate', 5) }, timeLimit*1000, undefined, function() { return runtime && !(runtime.shouldAnythingRender || EventLoop.hasPendingNonTimerEvents()) });
		if( failure instanceof JavaException || failure instanceof Error ) {
            return JSON.stringify({ result : false, data : {field: formClass.name, error: failure.message + "\n" + failure.stack }});
		} else {
			var node = runtime.nodes[0];
			node.erroringChildren.forEach( function(node) { errors.push( {field: node.field.name, error: node.lastError} ) } );
			console.timeEnd('Nashorn validation took');
			return JSON.stringify({ result : errors.length == 0, data : errors});
		}
	}
})();

var ssr = (function () {
	return function(jsonModel, formClass, timeLimit, waitAjax) {
		var Core = require('dfe-core');
		var DOM = require('dfe-dom');
		var ajaxCache = require('ajaxCache');
		var uiUtils = require('ui/utils');
		var runtime, node = DOM.createElement('span'), ajaxKeys = new Set(), ajaxPrime = []; 
		try {
			var ajaxCacheCallback = function(key, promise){
				ajaxKeys.has(key) || (ajaxKeys.add(key), promise.then(function(payload){ ajaxPrime.push({key: key, payload: payload}) }))
			}
			EventLoop.run(function() {
				ajaxCache.setCallback(waitAjax ? ajaxCacheCallback : null);
				runtime = new Core.Runtime().setDfeForm(formClass).setModel(JSON.parse(jsonModel));
				runtime.restart(node, undefined, 5);
			}, timeLimit*1000, undefined, function() {
				return runtime && !(runtime.shouldAnythingRender || waitAjax && EventLoop.hasPendingNonTimerEvents()) 
			});
			var styles = uiUtils.getAllCustomStyles([runtime.nodes[0].field]);
			return { 
				styles: Object.keys(styles).map(function(name) { return '<style id="' + name + '-custom-style">' + styles[name] + '</style>' }).join(''),
				script: 'require(["ajaxCache"], function(ajaxCache){' + ajaxPrime.map(function(o) { return 'ajaxCache.putResolved("' + o.key + '", ' + JSON.stringify(o.payload) + ')' } ).join(",") + '})', 
				html: node.serialize([]).join('') 
			}
		} finally {
			runtime && runtime.shutdown();
		}
	}
})();
