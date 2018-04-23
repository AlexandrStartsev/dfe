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

var JavaCompletableFuture = Java.type('java.util.concurrent.CompletableFuture');
var JavaConcurrentHashMap = Java.type('java.util.concurrent.ConcurrentHashMap');
var JavaTimeUnit = Java.type('java.util.concurrent.TimeUnit');

var Symbol = {iterator: 'Symbol(Symbol.iterator)'};
 
var setTimeout = function(f) {f()};
var setImmediate = function(f) {f()};
var setInterval = function() {};
var clearInterval = function() {};

var Set = Java.type('com.arrow.util.experimental.collections.NashornSet'); 
var Map = Java.type('com.arrow.util.experimental.collections.NashornMap'); 

Set.prototype.constructor = Set;
Map.prototype.constructor = Map;

//########################################################################################

var console = { 
    timeMap : new Map(),
    log : function (a) { print(a); }, 
    error : function (a) { print(a); },
    time : function(s) { this.timeMap.set(s, java.lang.System.currentTimeMillis()) },
    timeEnd : function(s) { print(s + ": " + (java.lang.System.currentTimeMillis() - this.timeMap.get(s)) + "ms" ); this.timeMap.delete(s); }
}

var alert = console.log;

var executor = java.util.concurrent.Executors.newCachedThreadPool();

(function(setup) {
	setup(this, 120, baseUrl, executor, new JavaConcurrentHashMap(), new JavaConcurrentHashMap(), new (Java.type('java.util.concurrent.atomic.AtomicInteger'))())
})(function (global, timeOut, baseUrl, executor, modules, loadLock, moduleIdx){
	var JavaTimeUnit = Java.type('java.util.concurrent.TimeUnit');
	var JavaException = Java.type('java.lang.Exception');
	var JavaExperimentalUtilsFactory = Java.type('com.arrow.util.experimental.ExperimentalUtilsFactory');
	var JavaCompletableFuture = Java.type('java.util.concurrent.CompletableFuture');
	var JavaRunnable = Java.type('java.lang.Runnable');
	function executeAsync(task) {
		executor.submit(new (Java.extend(JavaRunnable, { run: task })));
	}
	
	var formUriBase = 'classpath:conf/dfe-experimental/forms/';
	var dummy = function() { return dummy; }
	
	dummy.__noSuchProperty__ =dummy;
	dummy.__noSuchMethod__ = dummy;
	
	var currentModule = new (Java.type('java.lang.ThreadLocal'))();
	
	//TODO: lookup via proper config: baseUrl/paths/map
	function resolveModuleFutureSync (future, d) { 
		//future here already bound to module name, so once module is defined and all its dependencies are resolved, future will complete.  
		if( d.indexOf('ui/') == 0 ) {
			future.complete(dummy);
			return ;
		}
		if( d.indexOf('forms/') == 0 ) {
			//loadModule( d, formsUrlBase + d.substr(6) ); - if we can guarantee forms are already transpiled 
			loadFormSync(formUriBase, d.replace(/^forms\/|!es5$|!es6$/g,''));
			return ;
		}
		if( d.indexOf('components/') == 0 ) {
			future.complete(require('validation/component'));
			return ;
		}
		loadModuleSync( d, baseUrl + '/experimental/' + (d.indexOf('validation/') == 0 || d == 'component-maker' ? 'dfe-core' : d) + '.js' );
	}
	
	var loadFormSync = function(formUriBase, formName) {
		var moduleName = 'forms/' + formName;
		var scriptId = moduleName + '!script';
		var scriptName = formUriBase + formName + '.js';
		var transpiledScriptName = formUriBase + '.transpiled/' + formName + '.js';
		loadLock.computeIfAbsent(moduleName, function() {
			console.log('Nashorn loading module "' + moduleName + '" from ' + scriptName);
			var code = JavaExperimentalUtilsFactory.getUriAsString(scriptName), transpiled;
			currentModule.set(moduleName);
			define(moduleName + '!es6', function() { return code });
			try {
				transpiled = JavaExperimentalUtilsFactory.getUriAsString(transpiledScriptName);
			} catch(e) {
				transpiled = require('babel').transform(code, { plugins: ['transform-es3-property-literals', 'transform-es3-member-expression-literals'], presets : ['es2015']}).code;
			}
			define(moduleName + '!es5', function() { return transpiled });
			load({name: transpiledScriptName, script: transpiled} );
		});
	}
	
	var loadModuleSync = function(moduleName, uri) {
		loadLock.computeIfAbsent(moduleName, function() {
			console.log('Nashorn loading module "' + moduleName + '" from ' + uri);
			currentModule.set(moduleName);			
			load({name: uri, script: JavaExperimentalUtilsFactory.getUriAsString(uri)}); //load(uri); 
		});
	}
	
	var requireAsFuture = function (d, module) {
		switch(d){
			case 'module': 
				return JavaCompletableFuture.completedFuture(module);
			case 'exports': 
				return JavaCompletableFuture.completedFuture(module.exports);
			case 'require': 
				return JavaCompletableFuture.completedFuture(require);
			default:
				return modules.computeIfAbsent(d, function() {
					var future = new JavaCompletableFuture();
					executeAsync(function(){
						try {
							resolveModuleFutureSync(future, d);
						} catch(e) {
							future.completeExceptionally(new JavaException(e));// throw e;
						}
					})		
					return future;
				});
		}
	}	
	
	var require = function(d, cb, rj, module) {
		if(typeof d == 'string') {
			return requireAsFuture(d, module).get(timeOut, JavaTimeUnit.SECONDS);
		}
		if(Array.isArray(d)) {
			var future = new JavaCompletableFuture();
			executeAsync(function(){
				try {
					JavaCompletableFuture.allOf( d.map( function(i) { return requireAsFuture(i, module) } ) ).get(timeOut, JavaTimeUnit.SECONDS);
					var args = d.map( function(d) { return require(d, null, null, module) } );
					typeof cb == 'function' && cb.apply(global, args);
					future.complete(args);
				} catch(e) {
					typeof rj == 'function' && rj(e);
					future.completeExceptionally(new JavaException(e));// throw e;
				}
			});
			return future;
		}
	}
	
	var define = function(n, d, cb) {
		//console.log("defining module: " + (typeof n == 'string' ? n : '<auto>') + ", initiated by requested module: " + currentModule.get());
		if(typeof n != 'string') {
			cb = d;
			d = n;
			n = currentModule.get() || '_anonymous_' + moduleIdx.incrementAndGet();
		}
		var r, exports = {}, module = { id: n, uri: '<unsupported>', config: {}, exports: exports };
		if(!Array.isArray(d) ) { 
			cb = d; 
			d = [ 'require', 'exports', 'module' ]; 
		}
		var future = modules.computeIfAbsent(n, function() { return new JavaCompletableFuture() });
		require(d, function(){
			future.complete(typeof cb == 'function' && ( cb.apply(exports, arguments) ) || exports || undefined);
		}, function(e) {
			future.completeExceptionally(new JavaException('Failed to define module ' + n, new JavaException(e)));
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

	global.requirejs = global.require = require;
	global.define = require.define =define;

	require.require = require;
	require.undef = function(n) { modules.remove(n); }
	require.define.amd = { jQuery: false };
	require.requireAsFuture = requireAsFuture;
	require.makeModuleFromSource = makeModuleFromSource;
});

require('dfe-core');

var ajaxCache = (function() {
    var storage = com.arrow.util.experimental.CacheHandler.sharedCache('ajaxCache', '1000', '60'), extend = function(from, to) {for (var key in from) to[key] = from[key]; return to; }
    return {
        clear: function() {
            storage.clear();
        },
        get: function(opt) {
            if(typeof opt != 'string' && !opt.url) {
                var u = '/AJAXServlet.srv?';
                for(var o in opt)
                    (Array.isArray(opt[o])?opt[o]:[opt[o]]).forEach(function(v){
                        u += encodeURIComponent(o) + '=' + encodeURIComponent(typeof v == 'object' ? JSON.stringify(v) : v) + '&';
                    })
                opt = u.replace(/\&$/,'');
            }
            var url = typeof opt == 'string' ? opt : opt.url, key = url;
            if(storage.has(key)) {
                return storage.get(key);
            } else {
                var v, context = {}, dataType = opt.dataType || 'json', so = typeof opt.data == 'object';
                var hrds = extend(opt.headers, {'Content-Type' : so ? 'application/json' : 'application/x-www-form-urlencoded'});
                try {
                	com.arrow.util.experimental.AjaxHandler.handle(context, so ? url : url + '&cacheKey=' + encodeURIComponent(key), opt.type || 'GET', dataType, so ? extend(opt.data, {cacheKey: key}) : opt.data, o.headers);
        			return this.put(key, context.responseString, dataType, context.statusString);
        		} catch(e) { 
        			return this.put(key, context.responseString, dataType, 'error', e); 
        		}
            }
        },
        put: function(key, responseString, dataType, statusString, ex) {
            var ok = false, v, result;
            statusString = statusString||'success';
            try {
            	if( statusString == 'success' ) {
            		result = dataType == 'json' ? JSON.parse(responseString) : responseString;
            		ok = true;
    			} else {
    				result = {xhr: {statusText: statusString, responseText : responseString}, exception: ex}
    			}
    		} catch(e) { 
    			result = {xhr: {statusText: statusString, responseText : responseString}, exception: e}; 
    		}
    		storage.set(key, v = { 
				done: ok ? 1:2, 
				result: result,
				then: function(success, error) { ok ? typeof success == 'function' && success(result) : typeof error == 'function' && error(result) },
				fail: function(error) { this.then(0, error) }
			});
            return v;
        }
    }
})();