//var nativeListClass = (new (Java.type('java.util.ArrayList'))()).getClass().getInterfaces()[0];

Array.isArray || (Array.isArray = function(o) { return o instanceof Array /*|| !o.constructor && nativeListClass.isInstance(o)*/ })
Array.prototype.forEach || (Array.prototype.forEach = function(f, a) { for(var i = 0; i < this.length; i++) f.call(a, this[i], i, this) })
Array.prototype.indexOf || (Array.prototype.indexOf = function(e) { var i=this.length-1; for(;i>=0 && this[i] != e;i--); return i; })
Array.prototype.filter || (Array.prototype.filter = function(f, a) { var r=[],i; for(i=0; i < this.length; i++) f.call(a, this[i], i, this) && r.push(this[i]); return r } )
Array.prototype.map || (Array.prototype.map = function(f, a) { var r=[],i; for(i=0; i < this.length; i++) r.push(f.call(a, this[i], i, this)); return r } )
Array.from || (Array.from = function(s) { 
    var r = [], o;
    Symbol && Symbol.iterator && (typeof s[Symbol.iterator] === 'function') && (s=s[Symbol.iterator]());
    if(typeof s.next === 'function') 
        while(!(o=s.next()).done) 
            r.push(o.value); 
    else 
        s.forEach(function(e) { r.push(e); } ); 
    return r; 
})

var CompletableFuture = Java.type('java.util.concurrent.CompletableFuture');
var TimeUnit = Java.type('java.util.concurrent.TimeUnit');

var Symbol = Symbol || {}
Symbol.iterator || (Symbol.iterator='Symbol(Symbol.iterator)')
 
typeof setTimeout    !== 'undefined' || (setTimeout    = function(f) {f()});
typeof setImmediate    !== 'undefined' || (setImmediate    = function(f) {f()});
typeof setInterval   !== 'undefined' || (setInterval   = function() {});
typeof clearInterval !== 'undefined' || (clearInterval = function() {});

var AjaxHandler = Java.type('com.arrow.util.experimental.AjaxHandler');
var CacheHandler = Java.type('com.arrow.util.experimental.CacheHandler');

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

// TODO: something about this:
function yyyymmdd(dt) {
	var mm = dt.getMonth() + 1, dd = dt.getDate();
	return [dt.getFullYear(),(mm>9 ? '' : '0') + mm,(dd>9 ? '' : '0') + dd].join('');
}

function ARFtoDate(ad) { 
    Array.isArray(ad) && (ad=ad[0]);
    var dt = new Date(ad.substr(0, 4),ad.substr(4, 2)-1,ad.substr(6, 2)); 
    return (dt == 'Invalid&nbsp;Date' || yyyymmdd(dt) != ad) ? 'Invalid&nbsp;Date' : dt;
}

/* TODO: introduce session scope for certain paths so we can properly use require('forms/...') on java side 
    instead of having to override "defineForm" and bypass require altogether  
 */

global.requirejs = (function(g){
	var JavaException = Java.type('java.lang.Exception');
	var JavaExperimentalUtilsFactory = Java.type('com.arrow.util.experimental.ExperimentalUtilsFactory');
	
	var baseUrl = g.baseUrl;
	var formsUrlBase = baseUrl.replace(/([^/]*\/\/[^/]*\/).*/,'$1DfeServlet.srv?a=dfe&p=');
	var moduleIdx = new (Java.type('java.util.concurrent.atomic.AtomicInteger'))();	
	var modules = new (Java.type('java.util.concurrent.ConcurrentHashMap'))();
	var dummy = function() { return dummy; }
	
	dummy.__noSuchProperty__ =dummy;
	dummy.__noSuchMethod__ = dummy;
	
	modules.__loadingModule = '';

	//TODO: lookup via proper config: baseUrl/paths/map
	function resolveModuleFuture (future, d) {
		if( d.indexOf('ui/') == 0 ) {
			future.complete(dummy);
		} else {
			if( d.indexOf('forms/') == 0 ) {
				// TODO: problem here is that we may not have transpiled version of the form. So atm I'll just do easiest thing: pretend to be browser and ask DfeServlet.
				// Elaborate this. move forms management to require (but need to figure out how to plug session scope) 
				// g.loadModule( 'classpath:/conf/dfe-experimental/forms/.transpiled/' + d.substr(6) + '.js' );
				loadModule( formsUrlBase + d.substr(6) );
			} else {
				if( d.indexOf('components/') == 0 ) {
					future.complete(require('validation/component'));
				} else {
					loadModule( baseUrl + '/experimental/' + (d.indexOf('validation/') == 0 ? 'dfe-core' : d) + '.js' );
				}
			}
		}
	}
	
	var loadModule = function(moduleName, loadArg) {
		(function() {
			try {
				console.log('Nashorn loading module: ' + moduleName);
				if(loadArg) {
					modules.__loadingModule = moduleName;
					load(loadArg);
					modules.__loadingModule = '';
				} else {
					load(moduleName);
				}
			} catch(e) {
				throw 'Dependency loading error for ' + moduleName + ': ' + e.toString();
			}
		}).call(g);
	}
	
	var waitAll = function(d) {
		CompletableFuture.allOf( d.filter(function(i) { return i != 'exports' && i != 'module' }).map( function(i) { return requireAsFuture(i) } ) ).get(120, TimeUnit.SECONDS);
	}
	
	var requireAsFuture = function (d) {
		return modules.computeIfAbsent(d, function() {
			return JavaExperimentalUtilsFactory.maybeCompleteAsync( function(future) {
				resolveModuleFuture(future, d);
			} )
		});
	}	
	
	var require = function(d, cb) {
		if(typeof d == 'string') {
			return requireAsFuture(d).get(120, TimeUnit.SECONDS);
		}
		if(Array.isArray(d)) {
			CompletableFuture.allOf( d.map( function(i) { return requireAsFuture(i) } ) ).get(120, TimeUnit.SECONDS);
			return typeof cb == 'function' && cb.apply(g, d.map( function(d) { return require(d) } ) ) || undefined;
		}
	}
	var futureRequire = new CompletableFuture();
	futureRequire.complete(require);
	modules.require = futureRequire;
	
	require.define = function(n, d, cb) {
		if(typeof n != 'string') {
			cb = d;
			d = n;
			n = modules.__loadingModule || '_anonymous_' + moduleIdx.incrementAndGet();
		}
		var r, exports = {}, module = { id: n, uri: '<unsupported>', config: {}, exports: exports };
		if(!Array.isArray(d) ) { 
			cb = d; 
			d = 0; 
		}
		var future = modules.computeIfAbsent(n, function() { return new CompletableFuture() });
		try {
			d && waitAll(d);
			typeof cb == 'function' && ( r = cb.apply(g, d ? d.map( function(d) { return d == 'exports' ? exports : d == 'module' ? module : require(d) }) : [ require, exports, module ] ) );
			future.complete(r || exports || undefined);
		} catch(e) {
			modules.remove(n).completeExceptionally(new JavaException('Rejecting define for module ' + n + "\n" + e.toString())); // important: next require will try to re-fetch it. 
		}
	}

	require.require = require;
	require.undef = function(n) { modules.remove(n); }
	require.define.amd = { jQuery: false };
	require.requireAsFuture = requireAsFuture;
	
	return require ;
})(global);

global.require = global.requirejs;
global.define =  global.requirejs.define;


// TODO: rid of this, unify with client side -- when session scope config is in place because if we use "define" like this we'll override form for everyone
function defineForm(n, d, f) {
	define('forms/' + n, (d||[]).concat(['component-maker']), function() { 
    	var a = f.apply(this, arguments), cm = arguments[arguments.length-1]; 
    	a.name = n; 
    	(function _f(dfes) { dfes.forEach(function(dfe) { dfe.form||(dfe.form = a); _f(dfe.children) }) })(Array.isArray(a.dfe)?a.dfe:(a.dfe=[a.dfe]))
    	typeof a.setup == 'function' && a.setup();
    	return cm.fromForm(a) 
    })    
}

var ajaxCache = (function() {
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
    		storage.set(key, v = { done: 1,
    			then: function(success, error) { ok ? typeof success == 'function' && success(result) : typeof error == 'function' && error(result) },
    			fail: function(error) { this.then(0, error) }
    		});
            return v;
        }
    }
})()