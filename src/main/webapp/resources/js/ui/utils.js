require.config({
	waitSeconds : 7,
    paths: {
        echarts: 'ui/echarts-en.min'
    },
    bundles: {
        'dfe-core' : ['dfe-core'],
        'components/generic' : ['components/base', 
                                'components/dfe-runtime', 
                                'components/labeled-component', 
                                'components/switch', 
                                'components/editbox', 
                                'components/labeled-editbox', 
                                'components/labeled-switch', 
                                'components/editbox-money', 
                                'components/labeled-editbox-money', 
                                'components/dropdown', 
                                'components/labeled-dropdown', 
                                'components/button', 
                                'components/container', 
                                'components/div', 
                                'components/html-form', 
                                'components/div-r', 
                                'components/tab-d', 
                                'components/tab-s', 
                                'components/div-c', 
                                'components/inline-rows',
                                'components/checkbox', 
                                'components/labeled-checkbox', 
                                'components/labeled-radiolist', 
                                'components/radiolist', 
                                'components/label', 
                                'components/html',
                                'components/span',
                                'components/table',
                                'components/text',
                                'components/textarea',
                                'components/editbox-popup',
                                'components/div-button',
                                'components/multioption',
                                'components/either' ]
    }
});


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
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/DfeServlet.srv?a=model');
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = function() {
			try {
			    if(xhr.readyState == 4 && xhr.status == 200) {
			    	var r = JSON.parse(xhr.responseText);
			    	runtime.notifyControls(runtime.findControls(r.data.map(function(v) {return v.field})), 'validate');
			    	(r.result ? onsuccess : onerror)(r, 'success');
			    }
			    xhr.readyState == 4 && xhr.status != 200 && onerror(xhr, xhr.statusText, e);
			} catch(e) { onerror(xhr, 'error', e) }
		}		
		xhr.send(JSON.stringify(runtime.model_proxy.data));
	}
	try {
		var runtime = document.querySelector('div[dfe-form]')._dfe_runtime;
		var arf = runtime.model_proxy.data;
	    form.policy_formname.value = arf.policy[0].formname;
	    if(action == 'next') {
	    	form.action.value = 'next_experimental';
	     	postModel(
	     		runtime, 
	     		function(){ 
	     			form.submit() 
	     		}, 
	     		function(xhr){
	     			document.getElementById('button_next').disabled = false;
	     			if(xhr.status == 401) {
	     				form.action = '/aex/session_expire.jsp';
	     				form.submit();
	     			} else {
	     				xhr.responseText && displayServerError(xhr.responseText);
		     			xhr.data && console.log(xhr.data);
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

define('ui/utils', ['dfe-core', 'module'], function(core, m) {
	function _extend(from, to) { for (var key in from) to[key] = from[key]; return to; }
    function setupNode(node) {
		var formName = node.getAttribute('dfe-form'), args = node.getAttribute('dfe-arguments'), model = node.getAttribute('dfe-model'), cur = node._dfe_runtime;
        if( !cur || cur.formName !== formName ) {
            model = (typeof model === 'string' && model != 0 ? eval(model) : node.dfeModel) || {};
            args = (typeof args === 'string' && args != 0 ? eval(args) : node.dfeArguments) || {};
            var pm = model instanceof Promise ? model : new Promise(function(r){ r(model) });
            Promise.all([require(['forms/' + formName]), pm]).then(function(values) {
                cur = node._dfe_runtime;
                var dfe = values[0], arf = values[1];
                if(cur && cur.formName !== formName) {
                    cur.shutdown();
                    cur = null;
                }
                if(!cur) node._dfe_runtime = core.startRuntime(_extend(args, { model : arf, node: node, form: dfe, params: {formName: formName} }));
            })
        }
	}
    var _isIE7 = (navigator.appVersion.indexOf("MSIE 7.") != -1);
    var _isIE8 = (navigator.appVersion.indexOf("MSIE 8.") != -1);
    navigator.appVersion.match(/MSIE (8|9)/) && setInterval(function() { 
    	try { document.getElementById('innercontainer').style.width = (document.getElementById('body').clientWidth + document.getElementsByClassName('nav-menu-options')[0].clientWidth + 20) + 'px' } catch(e) {}
    }, 100);
    var styleUri = m.uri.replace(m.id.match(/[^\/]*$/)[0] + '.js', 'dfe-style.css'), link = document.createElement('link');
    link.setAttribute('rel', "stylesheet");
    link.setAttribute('type', "text/css");
    link.setAttribute('href', styleUri);
    var document_head = _isIE7 || _isIE8 ? document.getElementsByTagName('head')[0] : document.head;
    document_head.appendChild(link);
    function lookup() { for(var n = document.querySelectorAll('[dfe-form]'), i = 0; i < n.length; setupNode(n[i++])); }
    setInterval(lookup, 100);
    setTimeout(lookup, 0); 
    return {
        setAttribute: function (node, name, value) { 
        	if(value===true) value = '';
            if(typeof value=='string') { /*_isIE7 ? jq(node).attr(name, value) :*/ node.setAttribute(name, value); return true; } else node.removeAttribute(name); 
        },
        addEventListener: function (node, eventname, handler, capture) {
            typeof node.addEventListener === 'function' ? node.addEventListener(eventname, handler, capture) : node.attachEvent('on' + eventname, handler);
        },
        removeEventListener: function (node, eventname, handler, capture) {
            typeof node.removeEventListener === 'function' ? node.removeEventListener(eventname, handler, capture) : node.detachEvent('on' + eventname, handler);
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
		},
		setupNode: setupNode
    }
});

var ajaxCache = (function() {
    var storage = new Map(), extend = function(from, to) {for (var key in from) to[key] = from[key]; return to; }
    return {
        clear: function() {
            storage.clear();
        },
        get: function(opt) {
            if(typeof opt != 'string' && !opt.url) { // method: ... action: ...
                var u = //'https://cors-anywhere.herokuapp.com/
                        'https://arrowheadexchange.com/AJAXServlet.srv?';
                //var u = '/AJAXServlet.srv?';
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
                                    resolve(v.result = typeof r == 'string' && dataType == 'json' ? JSON.parse(r) : r)
                                } catch(e) {
                                	v.done = 2;
                                    reject(v.result = {xhr: xhr, exception: e});
                                }
                            else {
                            	v.done = 2;
                                reject(v.result = {xhr: xhr});
                            }
                        }
                    }
                    xhr.send(so ? extend(opt.data, {cacheKey: key}) : opt.data);
                }));
                return v;
            }
        }
    }
})()
