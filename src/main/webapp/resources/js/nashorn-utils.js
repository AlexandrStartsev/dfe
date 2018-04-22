(function(setupGlobal, setupRequireJS){
	setupGlobal();
	setupRequireJS(new JavaConcurrentHashMap(), new JavaConcurrentHashMap(), new (Java.type('java.util.concurrent.atomic.AtomicInteger'))());
	require('dfe-core');
})(function () {
	var g = (function(){return this})();
	g.Array.isArray = function(o) { return o instanceof Array }
	g.Array.prototype.forEach = function(f, a) { for(var i = 0; i < this.length; i++) f.call(a, this[i], i, this) }
	g.Array.prototype.indexOf = function(e) { var i=this.length-1; for(;i>=0 && this[i] != e;i--); return i; }
	g.Array.prototype.filter = function(f, a) { var r=[],i; for(i=0; i < this.length; i++) f.call(a, this[i], i, this) && r.push(this[i]); return r }
	g.Array.prototype.map = function(f, a) { var r=[],i; for(i=0; i < this.length; i++) r.push(f.call(a, this[i], i, this)); return r }
	g.Array.from = function(s) { 
	    var r = [], o;
	    typeof s[g.Symbol.iterator] === 'function' && (s = s[g.Symbol.iterator]());
	    if(typeof s.next === 'function') 
	        while(!(o=s.next()).done) 
	            r.push(o.value); 
	    else 
	        s.forEach(function(e) { r.push(e); } ); 
	    return r; 
	}
	
	g.CompletableFuture = Java.type('java.util.concurrent.CompletableFuture');
	g.JavaConcurrentHashMap = Java.type('java.util.concurrent.ConcurrentHashMap');
	g.TimeUnit = Java.type('java.util.concurrent.TimeUnit');
	
	g.Symbol = {iterator: 'Symbol(Symbol.iterator)'};
	 
	g.setTimeout = function(f) {f()};
	g.setImmediate = function(f) {f()};
	g.setInterval = function() {};
	g.clearInterval = function() {};
	
	g.AjaxHandler = Java.type('com.arrow.util.experimental.AjaxHandler');
	g.CacheHandler = Java.type('com.arrow.util.experimental.CacheHandler');
	
	g.Set = Java.type('com.arrow.util.experimental.collections.NashornSet'); 
	g.Map = Java.type('com.arrow.util.experimental.collections.NashornMap'); 
	
	g.Set.prototype.constructor = g.Set;
	g.Map.prototype.constructor = g.Map;
	
	//########################################################################################
	
	g.console = { 
	    timeMap : new Map(),
	    log : function (a) { print(a); }, 
	    error : function (a) { print(a); },
	    time : function(s) { this.timeMap.set(s, java.lang.System.currentTimeMillis()) },
	    timeEnd : function(s) { print(s + ": " + (java.lang.System.currentTimeMillis() - this.timeMap.get(s)) + "ms" ); this.timeMap.delete(s); }
	}
	
	g.alert = console.log;
	
	g.ajaxCache = (function() {
	    var storage = CacheHandler.sharedCache('ajaxCache', '1000', '60'), extend = function(from, to) {for (var key in from) to[key] = from[key]; return to; }
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
	        			AjaxHandler.handle(context, so ? url : url + '&cacheKey=' + encodeURIComponent(key), opt.type || 'GET', dataType, so ? extend(opt.data, {cacheKey: key}) : opt.data, o.headers);
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
	})()
},function (modules, loadLock, moduleIdx){
	/* TODO: introduce session scope for certain paths so we can properly use require('forms/...') on java side 
	    instead of having to override "defineForm" and bypass require altogether  
	 */	
	var g = (function(){return this})();
	var timeOut = 120;
	var JavaException = Java.type('java.lang.Exception');
	var JavaExperimentalUtilsFactory = Java.type('com.arrow.util.experimental.ExperimentalUtilsFactory');
	
	var baseUrl = g.baseUrl;
	var formUriBase = 'classpath:conf/dfe-experimental/forms/';
	var dummy = function() { return dummy; }
	
	dummy.__noSuchProperty__ =dummy;
	dummy.__noSuchMethod__ = dummy;
	
	var __loadingModule = new (Java.type('java.lang.ThreadLocal'))();
	
	//TODO: lookup via proper config: baseUrl/paths/map
	function resolveModuleFuture (future, d) { 
		//future here already bound to module name, so once module is defined and all its dependencies are resolved, future will complete.  
		if( d.indexOf('ui/') == 0 ) {
			future.complete(dummy);
			return ;
		}
		if( d.indexOf('forms/') == 0 ) {
			//loadModule( d, formsUrlBase + d.substr(6) ); - if we decide to ditch whole "update in session" thing and move all forms to static where they will already be transpiled
			loadForm(formUriBase, d.replace(/^forms\/|!es5$|!es6$/g,''));
			return ;
		}
		if( d.indexOf('components/') == 0 ) {
			future.complete(require('validation/component'));
			return ;
		}
		loadModule( d, baseUrl + '/experimental/' + (d.indexOf('validation/') == 0 || d == 'component-maker' ? 'dfe-core' : d) + '.js' );
	}
	
	var loadForm = function(formUriBase, formName) {
		try {
			var moduleName = 'forms/' + formName;
			var scriptId = moduleName + '!script';
			var scriptName = formUriBase + formName + '.js';
			var transpiledScriptName = formUriBase + '.transpiled/' + formName + '.js';
			loadLock.computeIfAbsent(moduleName, function() {
				console.log('Nashorn loading module "' + moduleName + '" from ' + scriptName);
				return CompletableFuture.supplyAsync(function() { 
					var code = JavaExperimentalUtilsFactory.getUriAsString(scriptName), transpiled;
					define(moduleName + '!es6', function() { return code });
					try {
						transpiled = JavaExperimentalUtilsFactory.getUriAsString(transpiledScriptName);
					} catch(e) {
						transpiled = require('babel').transform(code, { plugins: ['transform-es3-property-literals', 'transform-es3-member-expression-literals'], presets : ['es2015']}).code;
					}
					define(moduleName + '!es5', function() { return transpiled });
					__loadingModule.set(moduleName);
					load({name: transpiledScriptName, script: transpiled} ); // TODO: loadWithNewGlobal, and pass require/define/__loadingModule - make new instance of require pointing to same modules, but with isolated __loadingModule
				});
			}).get(timeOut, TimeUnit.SECONDS);
		} catch(e) {
			loadLock.remove(moduleName);
			throw e;
		}
	}
	
	var loadModule = function(moduleName, uri) {
		try {
			loadLock.computeIfAbsent(moduleName, function() {
				console.log('Nashorn loading module "' + moduleName + '" from ' + uri);
				return CompletableFuture.supplyAsync(function() { 
					__loadingModule.set(moduleName);
					load(uri); // load({name: uri, script: JavaExperimentalUtilsFactory.getUriAsString(uri)});  
				})
			}).get(timeOut, TimeUnit.SECONDS);
		} catch(e) {
			loadLock.remove(moduleName);
			throw e;
		}
	}
	
	// TODO: wrap into Promise, make require([...]) return promise.
	var requireAsFuture = function (d, module) {
		switch(d){
			case 'module': 
				return CompletableFuture.completedFuture(module);
			case 'exports': 
				return CompletableFuture.completedFuture(module.exports);
			case 'require': 
				return CompletableFuture.completedFuture(require);
			default:
				return modules.computeIfAbsent(d, function() {
					return JavaExperimentalUtilsFactory.maybeCompleteAsync( function(future) {
						resolveModuleFuture(future, d);
					})
				});
		}
	}	
	
	var require = function(d, cb, rj, module) {
		if(typeof d == 'string') {
			return requireAsFuture(d, module).get(timeOut, TimeUnit.SECONDS);
		}
		if(Array.isArray(d)) {
			/*try { //synchronous requires/defines... 
				CompletableFuture.allOf( d.map( function(i) { return requireAsFuture(i, module) } ) ).get(timeOut, TimeUnit.SECONDS);
				var args = d.map( function(d) { return require(d, null, null, module) } );
				typeof cb == 'function' && cb.apply(g, args);
			} catch(e) {
				typeof rj == 'function' && rj(e);
				throw e;
			} */
			return JavaExperimentalUtilsFactory.maybeCompleteAsync( function(future) {
				try {
					CompletableFuture.allOf( d.map( function(i) { return requireAsFuture(i, module) } ) ).get(timeOut, TimeUnit.SECONDS);
					var args = d.map( function(d) { return require(d, null, null, module) } );
					typeof cb == 'function' && cb.apply(g, args);
					future.complete(args);
				} catch(e) {
					typeof rj == 'function' && rj(e);
					throw e;
				}
			});
		}
	}
	
	var define = function(n, d, cb) {
		//console.log("defining module: " + (typeof n == 'string' ? n : '<auto>') + ", initiated by requested module: " + __loadingModule.get());
		if(typeof n != 'string') {
			cb = d;
			d = n;
			n = __loadingModule.get() || '_anonymous_' + moduleIdx.incrementAndGet();
		}
		var r, exports = {}, module = { id: n, uri: '<unsupported>', config: {}, exports: exports };
		if(!Array.isArray(d) ) { 
			cb = d; 
			d = [ 'require', 'exports', 'module' ]; 
		}
		var future = modules.computeIfAbsent(n, function() { return new CompletableFuture() });
		require(d, function(){
			future.complete(typeof cb == 'function' && ( cb.apply(g, arguments) ) || exports || undefined);
		}, function(e) {
			future.completeExceptionally(new JavaException('Failed to define module ' + n, new JavaException(e)));
		}, module);
	}

	g.requirejs = g.require = require;
	g.define = require.define =define;

	require.require = require;
	require.undef = function(n) { modules.remove(n); }
	require.define.amd = { jQuery: false };
	require.requireAsFuture = requireAsFuture;
});

