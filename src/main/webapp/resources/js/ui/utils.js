// ############ polyfill for Array.*, Map and Set
Array.isArray || (Array.isArray = function(o) { return o instanceof Array })
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

var Map = Map || (
Map = function(i) { this.size = 0; i && Array.from(i).forEach(function(a) { a=Array.from(a); this.set(a[0], a[1]) }, this) },
Map.prototype.clear = function() { delete this.head; this.size = 0; },
Map.prototype[Symbol.iterator] = function() {
    return {
        pos: this.head,
        next: function () {
            return this.pos ? (r = { value: [this.pos.key, this.pos.value], done: false }, (this.pos=this.pos.next), r) : { done : true };
        }
    }
},
Map.prototype.keys = function() {
    return {
        pos: this.head,
        next: function () {
            return this.pos ? (r = { value: this.pos.key, done: false }, (this.pos=this.pos.next), r) : { done : true };
        }
    }
},
Map.prototype.values = function() {
    return {
        pos: this.head,
        next: function () {
            return this.pos ? (r = { value: this.pos.value, done: false }, (this.pos=this.pos.next), r) : { done : true };
        }
    }
},        
Map.prototype.entries = Map.prototype[Symbol.iterator],
Map.prototype.set = function(k,v) {
    if(!this.head) {
        this.head = {key: k, value: v};
        this.size++;
    } else {
        if(this.head.key == k) {
            this.head.value = v;
        } else {
            var h = this.head;
            for(; h.next && h.next.key != k; h=h.next) ;
            if(!h.next) {
                h.next = {key: k};
                this.size++;
            }
            h.next.value = v;
        }
    }
    return this; 
},
Map.prototype['delete'] = function(k) {
    if(this.head) {
        if(this.head.key == k) {
            this.head = this.head.next;
            this.size--;
            return true;
        } else {
            var h = this.head;
            for(; h.next && h.next.key != k ; h=h.next);
            if(h.next) {
                h.next = h.next.next;
                this.size --;
                return true;
            }
        }
    }
    return false;
},
Map.prototype.get = function(k) {
    var h = this.head;
    for(; h; h=h.next) 
        if(h && h.key == k) return h.value;
},
Map.prototype.has = function(k) { return typeof this.get(k) !== 'undefined'; },
Map.prototype.forEach = function(f, a) {
    var h = this.head;
    for(; h; h=h.next) 
        f.call(a, h.value, h.key, this);
},
Map.prototype.keys = function() { var ret = []; for(var h = this.head; h; h=h.next)  ret.push(h.key);  return ret;},
Map.prototype.values = function() { var ret = []; for(var h = this.head; h; h=h.next)  ret.push(h.value);  return ret;},
Map)

var Set = Set || (Set = function(i) { this.size = 0; i && Array.from(i).forEach(function(v) { this.add(v) }, this) },
Set.prototype[Symbol.iterator] = function() {
    return {
        pos: this.head,
        next: function () {
            return this.pos ? (r = { value: this.pos.key, done: false }, (this.pos=this.pos.next), r) : { done : true };
        }
    }
},
Set.prototype.keys = Set.prototype[Symbol.iterator],
Set.prototype.entries = Set.prototype[Symbol.iterator],
Set.prototype.add = function(k) {
    if(!this.head) {
        this.head = {key: k};
        this.size++;
    } else {
        if(this.head.key != k) {
            var h = this.head;
            for(; h.next && h.next.key != k; h=h.next) ;
            if(!h.next) {
                h.next = {key: k};
                this.size++;
            }
        }
    }
    return this; 
},
Set.prototype.clear = function() { delete this.head; this.size = 0; },
Set.prototype['delete'] = function(k) {
    if(this.head) {
        if(this.head.key == k) {
            this.head = this.head.next;
            this.size--;
            return true;
        } else {
            var h = this.head;
            for(; h.next && h.next.key != k ; h=h.next);
            if(h.next) {
                h.next = h.next.next;
                this.size --;
                return true;
            }
        }
    }
    return false;
},
Set.prototype.forEach = function (f, a) {
    for(var h = this.head; h; h=h.next) 
        f.call(a, h.key, this);
},
Set.prototype.has = function(k) { 
    for(var h = this.head; h; h=h.next) 
        if(h && h.key == k) return true;
    return false;
},
Set)

//###### JSON polyfill
window.JSON || (window.JSON = {
    parse: function(sJSON) { return eval('(' + sJSON + ')'); },
    stringify: (function () {
      var toString = Object.prototype.toString;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
      var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
      var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
      var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
      return function stringify(value) {
        if (value == null) {
          return 'null';
        } else if (typeof value === 'number') {
          return isFinite(value) ? value.toString() : 'null';
        } else if (typeof value === 'boolean') {
          return value.toString();
        } else if (typeof value === 'object') {
          if (typeof value.toJSON === 'function') {
            return stringify(value.toJSON());
          } else if (isArray(value)) {
            var res = '[';
            for (var i = 0; i < value.length; i++)
              res += (i ? ', ' : '') + stringify(value[i]);
            return res + ']';
          } else if (toString.call(value) === '[object Object]') {
            var tmp = [];
            for (var k in value) {
              // in case "hasOwnProperty" has been shadowed
              if (hasOwnProperty.call(value, k))
                tmp.push(stringify(k) + ': ' + stringify(value[k]));
            }
            return '{' + tmp.join(', ') + '}';
          }
        }
        return '"' + value.toString().replace(escRE, escFunc) + '"';
      };
    })()
  });
//===================================================================================

// TODO: wrap all this
function displayServerError(text) {
    require(['ui/jquery-ui'], function() {
        console.error(text),
        $('<div>')[text.match(/^</) ? 'html' : 'text'](text).dialog({ 
            classes: {'ui-dialog': 'server-error-dlg'}, 
            title: 'Server error', 
            width: 1000, 
            height: 400, 
            close: function() { 
                $(this).dialog('destroy') 
            } 
        }).focus()
    });
}

function dfe_navigate(form, action) {
	function _extend(from, to) { 
	    for (var key in from) to[key] = from[key]; return to;
	}
	function postModel(runtime, onsuccess, onerror) {
		typeof runtime.form.onpost == 'function' && runtime.form.onpost.call(runtime.form, _extend(runtime.model_proxy, function(p) { return arguments.callee.get(p); }), runtime);
		require('ui/jquery').ajax({ url: '/DfeServlet.srv?a=model', type: 'POST', dataType: 'json', contentType:"application/json", data: JSON.stringify(runtime.model_proxy.data),
	        success: function(r, s) { 
	        	runtime.notifyControls(runtime.findControls(r.data.map(function(v) {return v.field})), 'validate');
	        	(r.result ? onsuccess : onerror)(r, s);
	        },
	        error: function(d, s, e) { onerror(d, s, e); }
	    })		
	}
	try {
		var runtime = document.querySelector('div[dfe-form]')._dfe_runtime;
		var arf = runtime.model_proxy.data;
	    form.policy_formname.value = arf.policy[0].formname;
	    if(action == 'next') {
	    	form.action.value = 'next_experimental';
	     	/*
	     	typeof runtime.form.onpost == 'function' && runtime.form.onpost(_extend(runtime.model_proxy, function(p) { return arguments.callee.get(p); }), runtime);
	     	form.jsonModel.value = JSON.stringify(arf);
	     	form.submit();
	     	*/
	     	postModel(
	     		runtime, 
	     		function(){ 
	     			form.submit() 
	     		}, 
	     		function(xhr){
	     			if(xhr.status == 401) {
	     				form.action = '/aex/session_expire.jsp';
	     				form.submit();
	     			} else {
	     				xhr.responseText && displayServerError(xhr.responseText);
     					document.getElementById('button_next').disabled = false;
	     			}
		     	}
	     	);
	    }
	} catch(e) {
		displayServerError(e.toString());
		document.getElementById('button_next').disabled = false; 
	}
}

// support for nav tab
var DFE = DFE || {};
DFE.nav = function () {
    var postForm = function (form, formName) {
            form.action.value = 'load';
            form.policy_formname.value = formName;
            form.submit();
        },
        backNav = function (form, formName) {
            form.action.value = 'back';
            form.policy_formname.value = formName;
            form.submit();
        },
        reloadQuote = function (form, formName) {
            form.action.value = 'reload';
            form.policy_formname.value = formName;
            form.submit();
        },
        submitForm = function (form) {
        	dfe_navigate(form, 'next'); 
        };
    
    return {
        postForm:      postForm,
        backNav:       backNav,
        reloadQuote:   reloadQuote,
        submitForm:    submitForm
    };
} ();

require.config({
	waitSeconds : 3600,
    bundles: {
        'components/generic' : ['components/dual-with-label', 'components/editbox','components/c-editbox','components/editbox-$','components/c-editbox-$','components/dropdown','components/c-dropdown','components/button','components/container','components/div','components/form','components/div-r','components/tab-s','components/div-c','components/checkbox','components/c-checkbox','components/c-radiolist','components/radiolist','components/label','components/html','components/textarea','components/editbox-P','components/div-button','components/multioption','components/typeahead',/*'components/placeholder',*/'components/div-button-x'],
    },            
});

define('ui/utils', ['ui/jquery', 'module'], function(jq, m) {
    var _isIE7 = (navigator.appVersion.indexOf("MSIE 7.") != -1);
    var _isIE8 = (navigator.appVersion.indexOf("MSIE 8.") != -1);
    navigator.appVersion.match(/MSIE (8|9)/) && setInterval(function() {jq('#innercontainer').width(jq('#body').width() + jq('.nav-menu-options').width() + 20)}, 100);
    var styleUri = m.uri.replace(m.id.match(/[^\/]*$/)[0] + '.js', 'dfe-style.css'), link = document.createElement('link');
    link.setAttribute('rel', "stylesheet");
    link.setAttribute('type', "text/css");
    link.setAttribute('href', styleUri);
    var document_head = _isIE7 || _isIE8 ? document.getElementsByTagName('head')[0] : document.head;
    document_head.appendChild(link);
    return {
        setAttribute: function (node, name, value) { 
            if(value && value != 0) { _isIE7 ? jq(node).attr(name, value) : node.setAttribute(name, value); return true; } else node.removeAttribute(name); 
        },
        addEventListener: function (node, eventname, handler, capture) {
            typeof node.addEventListener === 'function' ? node.addEventListener(eventname, handler, capture) : jq(node).on(eventname, handler);
        },
        removeEventListener: function (node, eventname, handler, capture) {
            typeof node.removeEventListener === 'function' ? node.removeEventListener(eventname, handler, capture) : jq(node).off(eventname, handler);
        },
        removeNode: function(node) {
        	node && node.parentNode && node.parentNode.removeChild(node);
        },
        setDfeCustomStyle: function(css, formname) {
			if(typeof document == 'object') {
				var e;
				e = formname && document.getElementById(formname + '-custom-style') || document_head.appendChild(document.createElement('style'));
				formname && e.setAttribute('id', formname + '-custom-style');
				e.innerHTML = css;
			}
		}
    }
});

function defineForm(n, d, f) {
	var fx = function() {
	    var a = f.apply(this, arguments), m = new Map();
	    a.name = n;
	    a.dependencies = {};
	    f.toString().match(/\([^\)]*\)/)[0].replace(/\(|\)| /g,'').split(',').slice(1).forEach(function(n, i){
	        a.dependencies[n] = d[i + 1];
	    })
	    a.dfe.forEach(function(row) {
	        m.get(row.parent) ? m.get(row.parent).push(row) : m.set(row.parent, [ row ]);
	        (row.children = m.get(row.name)) || m.set(row.name, row.children = []);
	        row.pos || (row.pos = []);
	        Array.isArray(row.pos) || (row.pos = [row.pos]);
            for(var i = row.component.slots - row.pos.length; i; i > 0 ? (row.pos.push({}), i--) : (row.pos.pop(), i++)) ;
	    });
	    return a;
	}
	define("forms/" + n, d, fx); 
}

(function() {
	var l, _try = true, processed = new Set(), f = function(node){
        require(['dfe-core', 'forms/' + node.getAttribute('dfe-form')], function(core, dfe) {
        	var model = node.getAttribute('dfe-model'), f = function(arf) { core.startRuntime({ model : arf, node: node, form: dfe, params: { launchThrottle: 500 } }) };
        	window[model] && typeof window[model].then == 'function' ? window[model].then(f) : f(window[model]); 
        })
    };
    (l = function() {
    	if(_try) {
			for(var n = document.querySelectorAll('div[dfe-form]'), i = 0; i < n.length; i++)  
				processed.has(n[i]) || ( processed.add(n[i]), f(n[i]));
			setTimeout(l, 5);
    	}
	})();
	require(['ui/jquery'], function(jq) { jq(document).ready(function() { l(); _try = false }, false) });
})();

var ajaxCache = (function() {
    var storage = new Map(), extend = function(from, to) {for (var key in from) to[key] = from[key]; return to; }
    return {
        clear: function() {
            storage.clear();
        },
        get: function(opt) {
            if(typeof opt != 'string' && !opt.url) { // method: ... action: ...
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
                var v, xhr = new XMLHttpRequest(), dataType = opt.dataType || 'json', so = typeof opt.data == 'object';
                var hrds = extend(opt.headers, {'Content-Type' : so ? 'application/json' : 'application/x-www-form-urlencoded'});
                storage.set(key, v = new Promise(function(resolve, reject){
                    xhr.open(opt.type || 'GET', so ? url : url + '&cacheKey=' + encodeURIComponent(key));
                    for(var i in hrds) xhr.setRequestHeader(i, hrds[i]);
                    dataType == 'json' && xhr.setRequestHeader('Accept', 'application/json');
                    xhr.onreadystatechange = function() {
                        if(this.readyState === 4) {
                            v.done = 1;
                            if(this.status == 200)
                                try {
                                	var r = this.response || this.responseText;
                                    resolve(typeof r == 'string' && dataType == 'json' ? JSON.parse(r) : r)
                                } catch(e) {
                                    reject({xhr: xhr, exception: e});
                                }
                            else
                                reject({xhr: xhr});
                        }
                    }
                    xhr.send(so ? extend(opt.data, {cacheKey: key}) : opt.data);
                }));
                return v;
            }
        }
    }
})()