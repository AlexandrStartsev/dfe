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
var ajaxCache = CacheHandler.sharedCache('ajaxCache', '1000', '60');

// TODO: make amd
var $ = {
	ajax : function(o) {
		var context = {}, ok = false;
		try {
			AjaxHandler.handle(context, o.url, o.type, o.dataType, o.data, o.headers);
			if( context.statusString == 'success' ) {
				typeof o.success == "function" && o.success(JSON.parse(context.responseString), 'success');
				ok = true;
			}
		} catch(e) { 
			context.errorString = e.message; 
		}
		ok || typeof o.error == "function" && o.error('error', context.errorString);
    }
}
 
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
			if(loadArg) {
				global.__moduleName = moduleName;
				load(loadArg);
				delete global.__moduleName;
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
		if( d.indexOf('components/') == 0 ) {
			d = 'validation/component';
			global.loadModule( global.baseUrl + '/experimental/dfe-core.js' );
		}
		global.requirejs.modules[d] || global.loadModule( global.baseUrl + '/experimental/' + d + '.js' );
		return  global.requirejs.modules[d];
	}
	return Array.isArray(d) && typeof cb == 'function' && cb.apply(global, d.map( function(d) { return require(d) } ) ) || undefined;
}

global.define = function(n, d, cb) {
	var r, exports = {}/* = global[n]||(global[n] = {})*/, module = { id: n, uri: '<unsupported>', config: {}, exports: exports };
	if(typeof n != 'string') {
		cb = d;
		d = n;
		n = global.__moduleName || '_anonymous_' + (++global.requirejs.modules.__moduleIdx);
	}
	if(!Array.isArray(d) ) { 
		cb = d; 
		d = 0; 
	}
	typeof cb == 'function' && ( r = cb.apply(global, d ? d.map( function(d) { return d == 'exports' ? exports : d == 'module' ? module : require(d) }) : [ global.require, exports, module ] ) );
	global.requirejs.modules[n] = r || exports || undefined;
}

global.requirejs.modules = { __moduleIdx : 0, require: global.require };
global.requirejs.require = global.requirejs;
global.requirejs.define = global.define;
global.requirejs.undef = function(n) { delete global.requirejs.modules[n]; delete global[n] }
global.define.amd = { jQuery: false };
global.define('require', function () { return global.require })

// TODO: rid of this, unify with client side -- when session scope config is in place because if we use "define" like this we'll override form for everyone
function defineForm(n, d, f) {
    var fx = function() {
        var a = f.apply(this, arguments), m = new Map(), i;
        a.name = n;
        a.dependencies = {};
        f.toString().match(/\([^\)]*\)/)[0].replace(/\(|\)| /g,'').split(',').slice(1).forEach(function(n, i){
            a.dependencies[n] = d[i + 1];
        })
        a.dfe.forEach(function(row) {
            m.get(row.parent) ? m.get(row.parent).push(row) : m.set(row.parent, [ row ]);
            (row.children = m.get(row.name)) || m.set(row.name, row.children = []);
        });
        return a;
    }
    return fx.apply(global, d.map( function(d) { return global.require(d) }));
}