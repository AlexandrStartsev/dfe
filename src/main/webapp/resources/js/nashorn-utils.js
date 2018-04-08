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

global.loadModule = function(moduleName, loadArg) {
	// TODO: sync this
	(function() {
		try {
			console.log('Nashorn loading module: ' + moduleName);
			if(loadArg) {
				global.requirejs.modules.__loadingModule = moduleName;
				load(loadArg);
				global.requirejs.modules.__loadingModule = '';
			} else {
				load(moduleName);
			}
		} catch(e) {
			console.error('Dependency loading error for ' + moduleName + ': ' + e.toString());
		}
	}).call(global);
}

global.requirejs = global.require = function(d, cb) {
	if(typeof d == 'string') {
		// TODO: lookup via proper config: baseUrl/paths/map
		var addr = d;
		if( d.indexOf('ui/') == 0 ) {
			return global.requirejs.modules.__dummy;
		}
		if( d.indexOf('forms/') == 0 ) {
			global.requirejs.modules[d] || global.loadModule( 'classpath:/conf/dfe-experimental/forms/.transpiled/' + d.substr(6) + '.js' );
		} else {
			if( d.indexOf('components/') == 0 ) {
				d = 'validation/component';
				addr = 'dfe-core';
			}
			if( d.indexOf('validation/') == 0 )
				addr = 'dfe-core';
			global.requirejs.modules[d] || global.loadModule( global.baseUrl + '/experimental/' + addr + '.js' );
		}
		return  global.requirejs.modules[d];
	}
	return Array.isArray(d) && typeof cb == 'function' && cb.apply(global, d.map( function(d) { return require(d) } ) ) || undefined;
}

global.define = function(n, d, cb) {
	var r, exports = {}, module = { id: n, uri: '<unsupported>', config: {}, exports: exports };
	if(typeof n != 'string') {
		cb = d;
		d = n;
		n = global.requirejs.modules.__loadingModule || '_anonymous_' + global.requirejs.modules.__moduleIdx.incrementAndGet();
	}
	if(!Array.isArray(d) ) { 
		cb = d; 
		d = 0; 
	}
	typeof cb == 'function' && ( r = cb.apply(global, d ? d.map( function(d) { return d == 'exports' ? exports : d == 'module' ? module : require(d) }) : [ global.require, exports, module ] ) );
	global.requirejs.modules[n] = r || exports || undefined;
}

global.requirejs.modules = new (Java.type('java.util.concurrent.ConcurrentHashMap'))();
global.requirejs.modules.require = global.require;
global.requirejs.modules.__loadingModule = '';
global.requirejs.modules.__moduleIdx = new (Java.type('java.util.concurrent.atomic.AtomicInteger'))();
global.requirejs.modules.__dummy = function() { return global.requirejs.modules.__dummy; }
global.requirejs.modules.__dummy.__noSuchProperty__ = global.requirejs.modules.__dummy;
global.requirejs.modules.__dummy.__noSuchMethod__ = global.requirejs.modules.__dummy;

global.requirejs.require = global.require;
global.requirejs.define = global.define;
global.requirejs.undef = function(n) { global.requirejs.modules.remove(n); }

global.define.amd = { jQuery: false };

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