define('dfe-core', ['dfe-common'], function(cmn) {
	//deep
	function __extend(from, to) { 
	    for (var key in from) { var v = from[key]; to[key] = (typeof v === 'object' && (v = __extend(v, Array.isArray(v) ? [] : {}, 1)) || v) } return to;
	}
	
	//###############################################################################################################################
	function JsonProxy(data, parents, elements, listener) {
	    this.parents = (parents || []);
	    this.elements = (elements || []);
	    this.data = data||{};
	    this.persisted = data;
	    this.listener = listener;
	    if(this.parents.length != this.elements.length) throw 'Oops';
	}          
	
	JsonProxy.prototype.toString = function() { return 'JsonProxy{' + this.elements.join('.') + '}' }
	
	/* Queries model from value(s) or subset(s) 
	 * @param {String} path full-path string i.e. 'policy.class.code' or relative path like '.code', '..class.code' etc
	 * @returns {String|JsonProxy|Array}
	 */
	JsonProxy.prototype.get = function (path) {
	    var sb = 0;
	    if(!path) return this;
	    if(path.charAt(0) == '.' ) {
	        var s = path.substr(1), ret;
	        if(s.indexOf('.') == -1 && s.length > 0) {
	            ret = this.data[s];
	            this.listener && this.listener.depend(this.data, s);
	            if( ret && Array.isArray(ret) ) { 
	                var t = ret, p = this.parents.concat(this), e = this.elements.concat(s); ret = [];
	                t.forEach(function (d) {
	                    ret.push(new JsonProxy(d, p, e, this.listener));
	                }, this);
	            }
	            return ret || [];
	        } else {
	            while(s.charAt(sb) == '.') sb++;
	            var p = this.elements.slice(0, this.elements.length-sb).join('.');
	            path = (p == '' ? s.substr(sb) : p + path.substr(sb));
	        }
	        if(sb == s.length) return this.parents.concat(this)[this.parents.length - sb];
	    } 
	    var p = path.split('.'), pa = this.parents.concat(this);
	    if(path.length == 0) return [new JsonProxy(pa[0].data, [], [], this.listener)];
	    var va = [pa[0]], maintained = true;
	    for(var i = 0; i < p.length && va.length > 0; i++) {
	       if(maintained && pa.length-sb > i+1 && i < p.length - 1 && this.elements[i] == p[i]) {
	          va = pa[i+1].data ? [pa[i+1]] : [];
	       } else {
	          var nva = [], e, listener = this.listener;
	          va.forEach(function(px){
	            if( px.data ) {
	               if(listener) listener.depend(px.data, p[i]);
	               if(e = px.data[p[i]]) {
	                  if(Array.isArray(e)) {
	                     var pars = px.parents.concat(px), els = p.slice(0, i+1);
	                     e.forEach(function(d){
	                        nva.push(new JsonProxy(d, pars, els, listener));
	                     });
	                  } else {
	                     nva.push(e);
	                  }
	               }
	            }
	          });
	          if(maintained && i == p.length - 1 && nva.length)
	              return Array.isArray(e) ? nva : nva[0]||[];
	          maintained = false;
	          va = nva;
	       }
	    }
	    return va;
	}
	 
	JsonProxy.prototype.shadow = function (path, defaults) {
	    if(path.length == 0) return [];
	    if(path.charAt(0) == '.') 
	        path = this.elements.join('.') + path;
	    var p = path.split('.'), me = this, pa = this.parents.concat(this), ret;
	    for(var i = 0; i < p.length; i++) 
	        if(!(pa.length > i + 1 && this.elements[i] == p[i])) {
	            pa = pa.slice(0, i+1);
	            for(var j = i + 1; j <= p.length; j++) 
	                pa = pa.concat(new JsonProxy(undefined, pa, p.slice(0, j), this.listener));
	            ret = pa.pop();
	            break ;
	        }
	    __extend(defaults, (ret = ret || new JsonProxy(undefined, this.parents, p, this.listener)).data);
	    return [ret];
	}
	
	JsonProxy.prototype.persist = function () {
	    if(!this.persisted ) {
	        var lp = this.parents[this.parents.length - 1], le = this.elements[this.parents.length - 1], arr;
	        lp.persist();
	        arr = lp.data[le] || (lp.data[le] = []);
	        if(arr.indexOf(this.persisted = this.data) == -1) {
	            arr.push(this.data);
	            this.listener && this.listener.notify(lp.data, le, 'a', this.data);
	        }
	    } 
	    return this;
	}
	 
	JsonProxy.prototype.append = function (path, defaults) {
	    var ret = this.shadow(path, defaults);
	    ret.forEach(function (px) { px.persist(); });
	    return ret;
	}
	
	JsonProxy.prototype.clone = function () {
	    var ret = (this.parents.length && this.parents[this.parents.length - 1].append('.' + this.elements[this.elements.length - 1])[0] || new JsonProxy({})).withListener(this.listener);
	    __extend(this.data, ret.data);
	    return ret;
	}
	    
	JsonProxy.prototype.set = function (path, value) {
	    if(!path) return ;
	    if(typeof path == 'object') {
	    	for(var i in path) this.set('.' + i, path[i]);
	    	return ;
	    }
	    if(Array.isArray(value)) value=value[0];
	    value || (value = '');
	    if(typeof value == 'number') value = value.toString();
	    var listener = this.listener, le, va, maintained = true, sb = 0, sd;
	    if(path.charAt(0) == '.') {
	        while(path.charAt(sb+1) == '.') sb++;
	        path = this.elements.slice(0, this.elements.length-sb).join('.') + path.substr(sb);
	        while( path.charAt(0) == '.' ) path = path.substr(1);
	    }
	    var p = path.split('.'), pa = this.parents.concat(this),
	    va = [pa[0]];
	    for(var i = 0; i < p.length - 1 && va.length > 0; i++) {
	    	if(maintained && pa.length-sb > i+1 && this.elements[i] == p[i]) {
	    		va = [pa[i+1]];
	    	} else {
	    		var nva = [], e;
	          	va.forEach(function(px){
	          		if((e = px.data[p[i]]) == undefined) e = [undefined];
	            	if(!Array.isArray(e)) throw 'Unable to overwrite property with subset';
	            	e.forEach(function(d){
	            		nva.push(new JsonProxy(d, px.parents.concat(px), p.slice(0, i+1), listener));
	            	});
	          	});
	          	maintained = false;
	          	va = nva;
	       	}
	       	value.length && va.forEach(function(px) {px.persist()});
	    }
	    le = p.pop();
	    va.forEach(function(px) {
	    	var v = px.data[le], old = v;
	    	if(typeof value == 'object') {
	    		Array.isArray(v) ? px.get('.' + le).forEach(function(px) { px.set(value)}) : px.append('.' + le, value);
	    	} else {
	    		if(v == undefined || v==[]) v = '';
	    		if(typeof v == 'number') v = v.toString();
	    		if(v != value) {
	    			if(value.length == 0) {
	    				delete px.data[le];
	    				listener && listener.notify(px.data, le, 'r', old); 
	    			} else {
	    				px.data[le] = value;
	    				listener && listener.notify(px.data, le, 'm', old, value.toString());
	    			}
		       }
	    	}
	    });
	}
	 
	JsonProxy.prototype.detach = function() {
	    if(this.persisted && this.parents.length > 0) {
	        var p = this.parents[this.parents.length - 1], e = this.elements[this.parents.length - 1];
	        var arr = p.data[e];
	        var idx = arr.indexOf(this.data);
	        if( idx != -1 ) {
	            arr.splice(idx, 1); 
	            arr.length || delete p.data[e]; 
	            this.listener && this.listener.notify(p.data, e, 'd', this.data);
	        }
	        delete this.persisted; // = undefined;
	    }
	}
	 
	JsonProxy.prototype.withListener = function(l) {
	    var ret = new JsonProxy(this.data, this.parents, this.elements, l);
	    ret.persisted = this.persisted;
	    return ret ;
	}
	
	//####################################SUPPORTING FUNCTIONS#######################################################################
	
	JsonProxy.indexOf = function(pxA, path, value) {
	    return Array.isArray(pxA) ? pxA.map(function(a){return a.get(path)}).indexOf(value) :
	        pxA.get(path).map(function(a){return a.data}).indexOf(pxA.data);
	}
	
	JsonProxy.prototype.index = function(depth) {
	    depth||(depth=1);
	    return JsonProxy.indexOf(this, '........'.substr(0, depth+1) + this.elements.slice(this.elements.length-depth, this.elements.length).join('.'));
	}
	
	/* returns first instance of subset or first item. 
	 * @param {String} path full-path string i.e. 'policy.class' or relative path like '.class'
	 * @returns {String|JsonProxy} 
	 */
	JsonProxy.prototype.first = function (path) { var v  = this.get(path); return (Array.isArray(v) ? v[0] : v)||[]; }
	
	/* retrieves existing value from model, if field doesn't exist, default value is assigned to field in model and returned. 
	 * @param {String} path full-path string i.e. 'policy.class' or relative path like '.class'
	 * @param {String} _default default value
	 * @returns {String|Array}
	 */
	JsonProxy.prototype.defaultValue = function (path, _default) { var ret = this.get(path); if(ret == 0 && _default) { this.set(path, _default); ret = this.get(path); } return ret; }
	
	/* similar to JsonProxy::defaultValue, but for subsets. If subset doesn't exist, instance will be added to a model and returned
	 * @param {String} path full-path string i.e. 'policy.class.code' or relative path like '.code', '..class.code' etc
	 * @param {Object} defaults - pre-populated fields only when appended
	 * @returns {Array} array of JsonProxy objects (with a length of at least 1)
	 */
	JsonProxy.prototype.defaultSubset = function (path, defaults) { var ret = this.get(path); if(ret == 0) { this.append(path, defaults); ret = this.get(path); } return ret; }

	/*
	 * @param {Object|JsonProxy} data to reflect onto current object. deep. notifications will dispatched, dependencies on data object field will not be made
	 */
	// TODO: flesh it out
	JsonProxy.prototype.reflect = function(data) {
		if(data instanceof JsonProxy) 
			data = data.persisted;
		if(typeof data != 'object')
			this.detach();
		else {
			this.persist();
			var s = new Set(), k, l = this.listener, dest = this.data;
			for(k in dest) s.add(k);
			for(k in data) {
				var d = data[k], isA = Array.isArray(d); 
				if(s.has(k)) {
					var cd = dest[k];
					if(cd != d) {// TODO
						dest[k] = d;
						l && l.notify(dest, k, 'm');
					}
					s['delete'](k);
				} else {
					dest[k] = d;
					l && l.notify(dest, k, 'm');
				}
			}
			s.forEach(function(k) {
				delete dest[k];
				l && l.notify(dest, k, 'r'); 
			})
		}
	}
	
    //###############################################################################################################################
	function DfeListener(dependencyMap, control) {
	    this.dpMap = dependencyMap || new Map();
	    this.control = control;
	}
	
	DfeListener.prototype.depend = function(data, element) {
	    if(this.control) {
	        var e = this.dpMap.get(data);
	        e || this.dpMap.set(data, e = new Map());
	        var l = e.get(element);
	        l || e.set(element, l = new Set());
	        if(!l.has(this.control)) {
	            l.add(this.control);
	            this.control.dependencies.push({data : data, element : element});
	        }
	    }
	}
	
	DfeListener.prototype.For = function(control) {
		return new DfeListener(this.dpMap, control);
	}
	
	DfeListener.prototype.notify = function(data, element, action, d1) {
	    var e, s;
	    (e = this.dpMap.get(data)) && (s = e.get(element)) && s.forEach(function (cc) {
	        cc.notifications.push({data : data, element : element, action : action, d1 : d1});
	    });
	    return true;
	}
	
	DfeListener.prototype.set = function (data, element, value, action) { if(data[element] != value) { data[element] = value; this.notify(data, element, action, value) }; return true; }
	DfeListener.prototype.get = function (data, element) { this.depend(data, element); return data[element]; }
	//###############################################################################################################################
	function DfeRuntime(rootUI, listener) {
        this.schedule = [];
	    this.rootUI = Array.isArray(rootUI)?rootUI:[rootUI];
	    this.listener = (listener || new DfeListener()).For(); 
	    this.controls = new Set();
	}
	
	DfeRuntime.prototype.setDfeForm = function(form) {
	    this.form = form;
	    this.root_field_proxy = new JsonProxy(form, [], [], this.listener).get('dfe');
	    return this;
	}
	
	DfeRuntime.prototype.setModel = function(model) {
	    this.model_proxy = new JsonProxy(model, [], [], this.listener);
	    return this;
	}
	
	DfeRuntime.prototype.stop = function () { 
	    clearInterval(this.processor); 
	}
	    
	DfeRuntime.prototype.shutdown = function () { 
	    clearInterval(this.processor);
	    this.controls.forEach(function(c) { this.evict(c) }, this);
	    delete this.rootControls;
	}
	
	DfeRuntime.prototype.restart = function(initAction, suppressOnstart) {
	    this.shutdown();
	    this.initAction = {action: initAction||'init'};        
	    var self = this, px = this.model_proxy;
	    if(px && this.root_field_proxy) {
	    	suppressOnstart || typeof this.form.onstart == 'function' && this.form.onstart.call(this.form, cmn.extend(px, function(p) { return px.get(p) }), this);
            var i = 0;
            this.rootControls = this.root_field_proxy.map(function(px) { 
                var c = this.addControl(this.parentControl, this.model_proxy, px); 
                c._allParentNodes = this.rootUI.slice(i, i += c.component.slots);
                return c; 
            }, this);
	        this.processInterceptors();
	        this.processor=setInterval(function() { self.processInterceptors(); }, 50);
	    }
	    return this;
	}
	
	DfeRuntime.prototype.store = function (control, value, method) {
	    var f = control.field.data.set || control.model.attrs.set;
	    typeof f == 'function' && f.call(control.field.data.form, control.model.unbound, value, method);
	}
	
	DfeRuntime.prototype.processInterceptors = function() {
        this.controls.forEach(function(control){
	    	if(control.notifications.length) {
	    		var events = control.notifications;
	            control.notifications = [];
	            this.render(control, events);
	        }
	    }, this);
        while(this.schedule.length) this.schedule.shift()(this);
	}
	
	DfeRuntime.prototype.processChildren = function(parent, rx, prx, fpx) {
	    if(parent.children.size || fpx.length ) {
	        var pc = parent.children, fields = new Map(), rows = new Map(), rkeys = new Set(), fkeys = new Set(), skeys = new Set(), i=0, m, present, a, f, n, c, d; 
	        parent.children.forEach(function(v, k) { rkeys.add(k);i++||v.forEach(function(c, f){fkeys.add(f)})});
	        (fpx||[]).forEach(function(fp) { d=fp.data,fields.set(d, fp); (typeof d['class'] == 'string' && d['class']!=''?skeys:fkeys).add(d) });
	        (rx||[]).forEach(function(r) { rows.set(r.data, r); rkeys.add(r.data)});
	        rkeys.forEach( function(r) { 
	            (m = pc.get(r))||pc.set(r, m = new Map()); 
	            present = rows.get(r); 
	            fkeys.forEach(function(k) {
	                c = m.get(k);
	                present && (f=fields.get(k)) ? c || m.set(k, this.addControl(parent, present, f)) : c && (this.evict(c), m['delete'](k));
	            }, this);
	            m.size || pc['delete'](r);
	        }, this);
	        m = parent.fixedChildren;
	        skeys.forEach(function(k) {
	            c = m.get(k);
	            (f=fields.get(k)) ? c || m.set(k, this.addControl(parent, prx, f)) : c && (this.evict(c), m['delete'](k));
	        }, this);  
	    }
	}
    /*    DfeRuntime.prototype.processSubform = function(parent, px, attrs, fpx) {
        typeof px.withListener != 'function' && (px = new JsonProxy(px, [], [], this.listener));
        var form = parent.component.form;
        parent._attrs = attrs;
        if(!parent.fixedChildren.size) {
	        fpx.forEach(function(fp) {
                var c = this.addControl(parent, px, fp);
                form.onstart == 'function' && form.onstart.call(form, px);
                parent.fixedChildren.set(fp.data, c);
	        }, this);
        } else {
            parent.fixedChildren.forEach(function(child) {
                child.model.data == px.data || child.model.reflect(px.data, false);
            });
        }
    }*/
    
	DfeRuntime.prototype.addControl = function (parentControl, model_proxy, field_proxy) {
	    if(field_proxy) {
	        var control = { parentControl : parentControl, 
                            dependencies : [], 
                            notifications : [this.initAction],
                            children : new Map(), 
                            fixedChildren : new Map(), 
                            erroringControls : new Set() };
	        this.controls.add(control);
	        this.prep$$(control, model_proxy, field_proxy);
	        this.verifyComponent(control);
	        return control;
	    }
	}
	
	DfeRuntime.prototype.evict = function(control) {
	   this.processChildren(control, [], {}, []);
	   control.component.purge(control);
	   this.cleanUpDependencies(control);
	   this.controls['delete'](control);
	   this.removeErroring(control);
	}
	
    var _wrapModel = (function(){
        var _m = []; for(var _it in new JsonProxy()) _it == 'listener' || _m.push(_it);
        return function(model, out, l) { for(var i = _m.length-1; i >=0; i-- ) out[_m[i]] = model[_m[i]]; out.listener = l; return out; }
    })()
    
	DfeRuntime.prototype.prep$$ = function(control, model_proxy, field_proxy) {
	    var runtime = this, listener = this.listener.For(control);
	    var field = control.field = field_proxy.withListener(listener);
        var model = control.model = _wrapModel(model_proxy, function(p) { return model.get(p) }, listener);
	    model.unbound = _wrapModel(model_proxy, function(p) { return model.unbound.get(p) }, this.listener);
        model.unbound.runtime = model.runtime = this;
	    model.unbound.control = model.control = control;
	    model.result = function(data) {
            var attrs = model.attrs, s, fpx = field.get('.children');
            if(fpx.length && typeof data == 'object') {
                Array.isArray(data)||(data=[data]);
                data[0] && typeof data[0].withListener != 'function' && (data=data.map(function(r){return new JsonProxy(r)}))
            }
            /*if(s = attrs.skip) { fpx = Array.isArray(s) ? fpx.filter(function(c) { return s.indexOf(c.data.name) == -1 } ) : fpx; }*/
            runtime.processChildren(control, data || [], attrs.hmodel, fpx);
	        control.component._render(control, control.data = data, control.error, attrs, model.events);
	    }
	    model.error = function(error, data) {
            data && (control.data = data);
	        if( control.doVal && (control.error = error) ) {
                control.stickyError = error;
                error == 'Simulated error' || runtime.notifyErroring(control);
                control.component._render(control, control.data, control.error, model.attrs, model.events);
	        }
	        return error;
	    }
	    model.errorwatch = function(ctrl) {
	    	var has = false;
	    	listener.get(ctrl||control.parentControl, 'erroringControls').forEach(function(c) {
	    		while(c && !has) has |= (c.model.data == model.data), c = c.parentControl;
	    	});
	    	has && model.error('Simulated error');
	    }
	    model.required = function(name, pattern, message) {
		    var val = model.get(name);
		    Array.isArray(val) && (val = val[0]);
		    if( typeof val === 'undefined' || val.toString().replace(/ /g, '') === '' ) model.error(message || 'Required');
		    else if( pattern === 'date' && !val.toString().match(cmn.arfDateRegExp) || pattern && pattern !== 'date' && ! val.match(pattern) )
		    	     model.error(message || 'Invalid format');
		         else return true ;
		}	   
	}
	
	DfeRuntime.prototype.removeErroring = function(control) {
		delete control.error;
	    for( var p=control.parentControl; p && p.erroringControls['delete'](control) && this.listener.notify(p, 'erroringControls'); p=p.parentControl ) ;
	}
	
	DfeRuntime.prototype.notifyErroring = function(control) {
	    for( var p = control.parentControl; p && !p.erroringControls.has(control); p = p.parentControl )
	    	p.erroringControls.add(control), this.listener.notify(p, 'erroringControls', 'validate'); 
	}
	
	DfeRuntime.prototype.render = function (control, events) {
	    try {
	        if(this.verifyComponent(control)) {
		        var m = control.model, d = control.field.data, l = m.listener, v, fg, fv;
		        m.events = events;
		        m.attrs = typeof d.atr != 'function' ? {} : d.atr.call(d.form, m);
		        m.attrs.hmodel || (m.attrs.hmodel = m);
		        m.control.doVal = control.component.doValidation(control, events, m.attrs);
		        this.removeErroring(control);
		        typeof (v = typeof (fg = d.get || m.attrs.get) != 'function' ? [] : fg.call(d.form, m)) == 'undefined' || m.result(v);
		        m.control.doVal && typeof (fv = d.val || m.attrs.val) == 'function' && fv.call(d.form, m);
	        }
	    } catch(e) { 
	        control.doVal = 1; try{ control.model.error(e.message) } catch (e) { } console.error(control.field + '\n' + e.message + '\n' + e.stack); 
		}
	}
	
	DfeRuntime.prototype.verifyComponent = function(control) {
	    var component = control.field.listener.get(control.field.data, 'component');
	    if( component != control.component ) {
	        if(control.component) {
	            control.component.emptyUI(control);
	            delete control.runtime;
	            delete control.data;
	            delete control.error;
	            delete control.stickyError;
	        }
	        control.component = component;
	    }
	    return control.component;
	}
	
	DfeRuntime.prototype.cleanUpDependencies = function(control) {
		var dpMap = this.listener.dpMap;
	    control.dependencies.forEach(function(dep) {
	        var eleMap = dpMap.get(dep.data);
	        if(eleMap) { 
	            var ctlSet = eleMap.get(dep.element);
	            if(ctlSet) {
	                ctlSet['delete'](control);
	                ctlSet.size || eleMap['delete'](dep.element);
	                eleMap.size || dpMap['delete'](dep.data);
	            }
	        }
	    }, this);
	    control.dependencies.splice(0);
	}
	
	DfeRuntime.prototype.notifyControls = function(controls, action) {
	   (Array.isArray(controls) ? controls : [controls]).forEach(function(control) { control.notifications.push({action : action||'n'}) }); /*this.render(control, [{action : action||'n'}]);*/
	}
	
	DfeRuntime.prototype.findChildren = function(controls, deep, includeSelf, field, model) {
	    var ret = new Set(), a = [];
	    function traverse(control) { 
	        control.children.forEach(function(v) { v.forEach(function(c) { 
	            (!field || c.field.data.name == field) && (!model || c.model.data == model.data ) && ret.add(c); 
	            traverse(c);
	        })});
	        control.fixedChildren.forEach(function(c) { 
	            (!field || c.field.data.name == field) && (!model || c.model.data == model.data ) && ret.add(c); 
	            traverse(c);
	        });
	    }
	    (Array.isArray(controls) ? controls : [controls]).forEach( function (c) { 
	        includeSelf && (!field || c.field.data.name == field) && (!model || c.model.data == model.data ) && ret.add(c); 
	        traverse(c); 
	    });
	    ret.forEach(function(k) { a.push(k); });
	    return a;
	}
	
	DfeRuntime.prototype.findControls = function(fields, model_proxy) {
	    var ret = [], array = (Array.isArray(fields) ? fields : [fields]);
	    this.controls.forEach(function(c) {
	        array.indexOf(c.field.data.name) != -1 && (!model_proxy || c.model.data == model_proxy.data ) && ret.push(c);
	    })
	    return ret;
	}
	
	function startRuntime(arg) {
		var m = arg.model, j = m instanceof JsonProxy || typeof m.shadow == 'function', listener = j && m.listener || arg.listener ||new DfeListener(), runtime = new DfeRuntime(arg.node, listener);
	    for(var v in arg.params) runtime[v] = arg.params[v];
	    j ? runtime.model_proxy = m.withListener(runtime.listener.For()) : runtime.setModel(m);
	    runtime.setDfeForm(arg.form).restart(arg.initAction);
        arg.ready && arg.ready(runtime, dfe, arg.model);
	    return runtime;
	} 
	
	return { JsonProxy: JsonProxy, DfeRuntime: DfeRuntime, startRuntime: startRuntime }
});

define('validation/component', ['dfe-common'], function(cmn) {
    return cmn.extend({
            cname: 'validator',
            _render: function(control, data, errs, attrs, events) {},
            doValidation: function(control, events, attrs) { 
                 return attrs ? !(attrs['disabled'] || attrs['hidden'] || (attrs.vstrategy && attrs.vstrategy.indexOf('none') != -1)) : true;
            },
            purge: function() {}
        }, function(n, f, c) { return cmn.extend( {name: n, children: c||[], component: arguments.callee }, f) });
})

define('component-maker', ['dfe-common', 'components/pass-through'], function(cmn, pt) {
    return {
        fromForm: function(dfe_form) {
            dfe_form.store = function($$, data, method) {
                for(var ctrl = $$.control; ctrl.field.data.form == dfe_form; ctrl = ctrl.parentControl);
                ctrl.component.store(ctrl, data, method)
            }
            dfe_form.attrs = function($$) {
                for(var ctrl = $$.control; ctrl.field.data.form == dfe_form; ctrl = ctrl.parentControl);
                return ctrl ? ctrl._attrs : $$.runtime;
            }
            var slots = Array.prototype.concat.apply([], dfe_form.dfe.map(function(d){ return d.pos })).length;
            return cmn.extend({form: dfe_form}, function(name, attrs) {
                return cmn.extend( { name: name, children: dfe_form.dfe, component: cmn.extend({ 
                    _render: function(control, data, errs, attrs, events) {
                        control._attrs = attrs;
                        data && typeof dfe_form.onstart == 'function' && (Array.isArray(data)?data:[data]).forEach(function(d) { dfe_form.onstart(d) });
                        pt._render(control, data, errs, attrs, events);
                    },
                    cname: 'forms/' + dfe_form.name,
                    slots: slots
                }, pt, {}) }, attrs)
            })
        }
    }
})

define('validation/validator', ['dfe-core', 'validation/component'], function(core, component) {
	function listener(c) {
		return {
	        depend : function () {},
	        notify : function (d, e, a, v) { 
	            if('mard'.indexOf(a) != -1) {
	                console.error('Model is mutating (' + c && c.field.data.name + '):\n' + JSON.stringify(d) + '\n' + e + '\n' + a + '\n' + v );
	                throw new Error('Model is mutating');
	            }
	            return true; 
	        },
	        get : function(data, elem) { return data[elem] },
	        For: function(o) { return listener(o); }
		}
	}
    return {
        validate: function(model, form) { //model, form
            console.time('Nashorn validation took');
            var rt = new core.DfeRuntime(null, listener()).setDfeForm(form).setModel(model).restart('validate', true), errors = [];
            rt.rootControls.forEach(function(r) {r.erroringControls.forEach(function(c) {errors.push(c)})});
            rt.stop(); //shutdown(); //GC will do it for us?  - but stopping is necessary on client side since they have processInterceptors loop going
            var e = errors.map(function(c) { return {field: c.field.data.name, error: c.error}});
            console.timeEnd('Nashorn validation took');
            return { result : e.length == 0, data : e};
        }
    }
});