"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** 
 *  collections polyfill
 */

Array.isArray = function(o) { return o instanceof Array }
Array.prototype.forEach = function(f, a) { for(var i = 0; i < this.length; i++) f.call(a, this[i], i, this) }
Array.prototype.indexOf = function(e) { var i=this.length-1; for(;i>=0 && this[i] != e;i--); return i; }
Array.prototype.filter = function(f, a) { var r=[],i; for(i=0; i < this.length; i++) f.call(a, this[i], i, this) && r.push(this[i]); return r }
Array.prototype.map = function(f, a) { var r=[],i; for(i=0; i < this.length; i++) r.push(f.call(a, this[i], i, this)); return r }
Array.from = function(s) { var r = [], o; typeof s[Symbol.iterator] === 'function' && (s = s[Symbol.iterator]()); if(typeof s.next === 'function') while(!(o=s.next()).done) r.push(o.value); else s.forEach(function(e) { r.push(e); } ); return r; }

var Symbol = {iterator: 'Symbol(Symbol.iterator)'};
var Set = Java.type('com.arrow.util.experimental.collections.NashornSet'); 
var Map = Java.type('com.arrow.util.experimental.collections.NashornMap'); 

Set.prototype.constructor = Set;
Map.prototype.constructor = Map;

/** 
 *  console polyfill
 */

var console = (function(){ 
	var JavaException = Java.type('java.lang.Exception');
    var timeMap = new Map();
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
    		return JSON.stringify(a);
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
 * Event loop with thread context. All "user" code will be executed with a single thread thus will remain thread-safe;  
 */

var JavaCompletableFuture = Java.type('java.util.concurrent.CompletableFuture');
var JavaConcurrentHashMap = Java.type('java.util.concurrent.ConcurrentHashMap');
var JavaAtomicInteger = Java.type('java.util.concurrent.atomic.AtomicInteger');
var JavaTimeUnit = Java.type('java.util.concurrent.TimeUnit');
var JavaThreadLocal = Java.type('java.lang.ThreadLocal');
var JavaLinkedBlockingQueue = Java.type('java.util.concurrent.LinkedBlockingQueue');
var JavaTimer = Java.type('java.util.Timer');
var JavaTimerTask = Java.type('java.util.TimerTask');
var JavaException = Java.type('java.lang.Exception');
var JavaExecutors = Java.type('java.util.concurrent.Executors');
var JavaRunnable = Java.type('java.lang.Runnable');
var JavaCallable = Java.type('java.util.concurrent.Callable');


function argsToArray(args, initialIndex, out) {
	var params = out||[];
	for(var i = initialIndex||0; i < arguments.length; i++) {
		params.push(args[i]);
	}
	return params;
}

var EventLoop = (function(){
	var threadContext = new JavaThreadLocal();
	
	function newEventLoopContext(httpServletRequest) {
		return {
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

	function shutdownEventLoopContext(ctx) {
		ctx.executor.shutdown();
		ctx.timer.cancel();
		ctx.eventQueue.drainTo([]);
		ctx.eventQueue = null;
	}

	function createQueueTask(callback, type, context, parameters) {
		var context = threadContext.get();
		var once = type !== 'interval', task = {
			id: context.counter.incrementAndGet(),
			execute: function() {
				once && context.pendingTasks.remove(task.id);
				if(task.status === 'scheduled') {
					try {
						task.result = callback.apply(context||null, parameters||[]);
					} catch (e) {
						console.error('Scheduled task [' + type + '] threw exception:', e);
						context.exceptions.add(e);
					} finally {
						once && (task.status = 'done');
					}
				}
			},
			type: type,
			status: 'scheduled',
			perform: function() {
				context.eventQueue.put(task)
			}
		}
		context.pendingTasks.put(task.id, task);
		return task;
	}
	
	/*function performQueueTask(task) {
		task.targetQueue.put(task);
	}*/
	
	function cancelQueueTask(task) {
		task.status = 'cancelled';
		threadContext.get().pendingTasks.remove(tt.task.id);
	}

	function executeNextTask() {
		var context = threadContext.get();
		if(context.pendingTasks.size() > 0) {
			context.eventQueue.take().execute();
			return true ;
		}
	}
	
	function run(rootTask, durationLimit, httpServletRequest, context) { 
		if(typeof durationLimit !== 'number' || durationLimit <= 0) {
			durationLimit = 10*1000;
		}
		var System = Java.type('java.lang.System');
		var context = newEventLoopContext(httpServletRequest);
		var mainThreadResult, mainThreadException;
		try {
			return context.supplyAsync(function(){
				threadContext.set(context);
				var ret;
				setImmediate(function(){
					ret = rootTask.apply(context, argsToArray(arguments, 2));
				})
				while(executeNextTask());
				return ret
			}).get(durationLimit, JavaTimeUnit.MILLISECONDS);
		} finally {
			console.log('Sutting down event loop');
			shutdownEventLoopContext(context);
		}
	}
	return {
		createQueueTask: createQueueTask,
		//performQueueTask: performQueueTask,
		cancelQueueTask: cancelQueueTask,
		run: run,
		getTimer: function () {
			return threadContext.get().timer
		},
		supplyAsync: function(task) {
			return threadContext.get().supplyAsync(task);
		}
	}
})( )

function setTimeout(callback, delay) { //...arguments
	var task = EventLoop.createQueueTask(callback, 'timeout', null, argsToArray(arguments, 2));
	var timerTask = new (Java.extend(JavaTimerTask, {
	    run: function() {
	    	task.perform();
	    	//EventLoop.performQueueTask(task);
	    }
	}))();
	EventLoop.getTimer().schedule(timerTask, delay);
	return {task: task, timerTask: timerTask};
}

function setInterval(callback, delay) { //...arguments
	var task = EventLoop.createQueueTask(callback, 'interval', null, argsToArray(arguments, 2));
	var timerTask = new (Java.extend(JavaTimerTask, {
	    run: function() {
	    	task.perform();
	    	//EventLoop.performQueueTask(task);
	    }
	}))();
	EventLoop.getTimer().scheduleAtFixedRate(timerTask, delay, delay);
	return {task: task, timerTask: timerTask};
}

function clearTimeout(tt) {
	tt.timerTask.cancel();
	EventLoop.cancelQueueTask(tt.task);
}

function clearInterval(tt) {
	clearTimeout(tt);
}

function setImmediate(callback) { //...arguments
	EventLoop.createQueueTask(callback, 'immediate', null, argsToArray(arguments, 1)).perform();
	//EventLoop.performQueueTask(EventLoop.createQueueTask(callback, 'immediate', null, argsToArray(arguments, 1)));
}

var XMLHttpRequest = (function(hostAddress){
	var JavaHttpClients = Java.type('org.apache.http.impl.client.HttpClients');
	var JavaHttpGet = Java.type('org.apache.http.client.methods.HttpGet');
	var JavaHttpPost = Java.type('org.apache.http.client.methods.HttpPost');
	var JavaStringEntity = Java.type('org.apache.http.entity.StringEntity');
	var JavaCloseableHttpResponse = Java.type('org.apache.http.client.methods.CloseableHttpResponse');
	var JavaEntityUtils = Java.type('org.apache.http.util.EntityUtils');
	var JavaBasicHttpContext = Java.type('org.apache.http.protocol.BasicHttpContext');
	
	return function () {
		var _this = this, impl = {
			schedule: [],
			client: JavaHttpClients.createDefault(),
			request: null,
			httpResponse: undefined,
			readyState: 0,
			status: 0,
			statusText: 'Not sent',
			responseText: undefined
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
				if( impl.httpResponse instanceof JavaCloseableHttpResponse ) {
					var resp = impl.httpResponse;
					var entity = resp.getEntity();
					impl.responseText = entity == null ? 'null' : JavaEntityUtils.toString(entity); 
					impl.status = resp.getStatusLine().getStatusCode();
					impl.statusText = resp.getStatusLine().getReasonPhrase();
					impl.httpResponse.close();
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
				impl.client.close();
			}
		}		
		this.setRequestHeader = function(name, value) {
			impl.request.setHeader(name, value);
		}
		this.open = function(method, url) {
			url = url.match(/http[s]?\:/) ? url : hostAddress + url;
			try {
				switch(method) {
				case 'GET':
					impl.request = new JavaHttpGet(url);
					break ;
				case 'POST':
					impl.request = new JavaHttpPost(url);
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
			var task = EventLoop.createQueueTask(handleExecutionComplete, 'httprequest');
			/** 
			 * Alex: if code below fails, and future isn't scheduled, pending task will remain and eventloop will "hang" until timeout.
			 * this doens't include async body (impl.client.execute...) - just supplyAsync / handl themselves, 
			 * so i don't think catch / cleanup are necessary. But keep an eye on this code. If things start acting up, check here first.  
			 */
			var future = EventLoop.supplyAsync(function() {
				return impl.client.execute(impl.request, new JavaBasicHttpContext()); // TODO: populate credentials and other stuff from  context::httpServletRequest
			});
			future.handle(function(response, exception) {
				impl.httpResponse = response||exception;
				task.perform();
				//EventLoop.performQueueTask(task);
			})
			impl.worker = { task : task, future: future }
			handleChangeState(2);
		}		
	}
})(__BASE_URL__);

/**
 *  Promise polyfill -- based on setImmediate/ setTimeout. As-is browser polyfill copy
 */

var Promise = (function(){"use strict";function e(){}function n(e){if(!(this instanceof n))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=undefined,this._deferreds=[],f(e,this)}function t(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,n._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var i;try{i=n(e._value)}catch(f){return void r(t.promise,f)}o(t.promise,i)}else(1===e._state?o:r)(t.promise,e._value)})):e._deferreds.push(t)}function o(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var o=t.then;if(t instanceof n)return e._state=3,e._value=t,void i(e);if("function"==typeof o)return void f(function(e,n){return function(){e.apply(n,arguments)}}(o,t),e)}e._state=1,e._value=t,i(e)}catch(u){r(e,u)}}function r(e,n){e._state=2,e._value=n,i(e)}function i(e){2===e._state&&0===e._deferreds.length&&n._immediateFn(function(){e._handled||n._unhandledRejectionFn(e._value)});for(var o=0,r=e._deferreds.length;r>o;o++)t(e,e._deferreds[o]);e._deferreds=null}function f(e,n){var t=!1;try{e(function(e){t||(t=!0,o(n,e))},function(e){t||(t=!0,r(n,e))})}catch(i){if(t)return;t=!0,r(n,i)}}var u=setTimeout;n.prototype["catch"]=function(e){return this.then(null,e)},n.prototype.then=function(n,o){var r=new this.constructor(e);return t(this,new function(e,n,t){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof n?n:null,this.promise=t}(n,o,r)),r},n.prototype["finally"]=function(e){var n=this.constructor;return this.then(function(t){return n.resolve(e()).then(function(){return t})},function(t){return n.resolve(e()).then(function(){return n.reject(t)})})},n.all=function(e){return new n(function(n,t){function o(e,f){try{if(f&&("object"==typeof f||"function"==typeof f)){var u=f.then;if("function"==typeof u)return void u.call(f,function(n){o(e,n)},t)}r[e]=f,0==--i&&n(r)}catch(c){t(c)}}if(!e||"undefined"==typeof e.length)throw new TypeError("Promise.all accepts an array");var r=Array.prototype.slice.call(e);if(0===r.length)return n([]);for(var i=r.length,f=0;r.length>f;f++)o(f,r[f])})},n.resolve=function(e){return e&&"object"==typeof e&&e.constructor===n?e:new n(function(n){n(e)})},n.reject=function(e){return new n(function(n,t){t(e)})},n.race=function(e){return new n(function(n,t){for(var o=0,r=e.length;r>o;o++)e[o].then(n,t)})},n._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){u(e,0)},n._unhandledRejectionFn=function(e){void 0!==console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};return n})();

console.log(
	EventLoop.run(function() {
		var result = 'none';
		setTimeout(console.log.bind(null, 'after 2 secs'), 2000);
		
		new Promise(function(resolve, reject){
			setTimeout(resolve.bind(null, "I'm promise"), 1000);
		}).then(console.log);
		console.log('hi there ' + java.lang.System.currentTimeMillis());
		
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/AJAXServlet.srv?method=CMAUVehicleScriptHelper&action=getVinLookupResults&vinNumber=5YFBURHE7HP596257');
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader('Accept', 'application/json');
		xhr.onreadystatechange = function () {
	        if (this.readyState === 4) {
	        	console.log('ajax returned')
	        	result = this.responseText;
	        } 
		}
		xhr.send();
		
		/*ajaxCache.get({ method: 'CMAUVehicleScriptHelper', action: 'getVinLookupResults', vinNumber: '5YFBURHE7HP596257' }).then(function(object) {
			result = object.result; //.isMatch;
		})
		*/
		return function() { return result };
	})()
)

