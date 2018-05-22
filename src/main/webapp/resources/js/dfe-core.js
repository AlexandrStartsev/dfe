define('dfe-core', ['dfe-dom'], function(document) {
    let arfDatePattern = /^(18|19|20)((\\d\\d(((0[1-9]|1[012])(0[1-9]|1[0-9]|2[0-8]))|((0[13578]|1[02])(29|30|31))|((0[4,6,9]|11)(29|30))))|(([02468][048]|[13579][26])0229))$/;
	//deep
	function deepCopy(to, from) { 
        Object.getOwnPropertyNames(from).forEach(key => {
            if(key !== 'key') {
                let v = from[key]; 
                to[key] = typeof v === 'object' ? deepCopy(Array.isArray(v) ? [] : {}, v) : v;
            }
        })
        return to;
	}
    
    let nextKey = 0;
	
	//###############################################################################################################################
    class JsonProxy {
        constructor(data, parents, elements, listener) {
            this.parents = (parents || []);
            this.elements = (elements || []);
            this.data = data||{};
            this.persisted = data;
            this.key = (this.data.key || (this.data.key = ++nextKey));
            this.listener = listener;
            if(this.parents.length != this.elements.length) throw 'Oops';
        }
        toString() {
            return 'JsonProxy{' + this.elements.join('.') + '}'
        }
        get(path) {
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
                                nva.push(typeof d == 'object' ? new JsonProxy(d, pars, els, listener) : d);
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
        
        shadow(path, defaults, consume) {
            if(path.length == 0) {
                return [];
            }
            if(path.charAt(0) == '.') {
                path = this.elements.join('.') + path;
            }
            let p = path.split('.'), me = this, pa = this.parents.concat(this), ret;
            for(let i = 0; i < p.length; i++) {
                if(!(pa.length > i + 1 && this.elements[i] == p[i])) {
                    pa = pa.slice(0, i+1);
                    for(var j = i + 1; j <= p.length; j++) 
                        pa = pa.concat(new JsonProxy(undefined, pa, p.slice(0, j), this.listener));
                    ret = pa.pop();
                    break ;
                }
            }
            ret = ret || new JsonProxy(undefined, this.parents, p, this.listener);
            if(typeof defaults === 'object') {
                if(consume) {
                    if(defaults instanceof JsonProxy) {
                        defaults.detach();
                        defaults.data.key = ret.data.key;
                        ret.data = defaults.data;
                    } else {
                        defaults.key = ret.data.key;
                        ret.data = defaults;
                    }
                } else {
                    deepCopy( ret.data, defaults instanceof JsonProxy ? defaults.data : defaults );
                }
            }
            return [ret];
        }

        isShadow() {
            return !this.persisted;
        }

        persist() {
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

        append(path, defaults, consume) {
            var ret = this.shadow(path, defaults, consume);
            ret.forEach(function (px) { px.persist(); });
            return ret;
        }

        clone() {
            var ret = (this.parents.length && this.parents[this.parents.length - 1].append('.' + this.elements[this.elements.length - 1])[0] || new JsonProxy({})).withListener(this.listener);
            deepCopy(ret.data, this.data);
            return ret;
        }

        set(path, value) {
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
                if(typeof value === 'object' || typeof value === 'function') {
                    if(v !== value) {
                        px.data[le] = value;
                        listener && listener.notify(px.data, le, 'm', old, value); 
                    }
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

        detach() {
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

        withListener(l) {
            var ret = new JsonProxy(this.data, this.parents, this.elements, l);
            ret.persisted = this.persisted;
            return ret ;
        }

        static indexOf(pxA, path, value) {
            return Array.isArray(pxA) ? pxA.map(function(a){return a.get(path)}).indexOf(value) :
                pxA.get(path).map(function(a){return a.data}).indexOf(pxA.data);
        }
        
        index(depth) {
            depth||(depth=1);
            return JsonProxy.indexOf(this, '........'.substr(0, depth+1) + this.elements.slice(this.elements.length-depth, this.elements.length).join('.'));
        }
        
        first(path) {
            var v  = this.get(path); return (Array.isArray(v) ? v[0] : v)||[];
        }
	
        defaultValue (path, _default) { 
            var ret = this.get(path); if(ret == 0 && _default) { this.set(path, _default); ret = this.get(path); } return ret; 
        }

        defaultSubset(path, defaults) {
            var ret = this.get(path); if(ret == 0) { this.append(path, defaults); ret = this.get(path); } return ret; 
        }

        hasChild(other) {
            return this.data === other.data || other.parents.some(p => p.data === this.data);
        }
        
        reflect(other) {
        	if(typeof other === 'object') {
	        	if(other instanceof JsonProxy) {
	        		// TODO: ...
	        	} else {
	        		Object.getOwnPropertyNames(this.data).forEach(prop => prop !== 'key' && other[prop] === undefined && this.set('.' + prop) );
	        		Object.getOwnPropertyNames(other).forEach(prop => prop !== 'key' && this.set('.' + prop, other[prop]));
	        	}
        	}
        }
    }

    //###############################################################################################################################
    
	class DfeListener {
        constructor(dependencyMap, node) {
            this.dpMap = dependencyMap || new Map();
            this.node = node;
            this.dependencies = [];
        }
        
        undepend() {
            this.dependencies.forEach(dep => {
                let eleMap = this.dpMap.get(dep.data);
                if(eleMap) { 
                    let ctlSet = eleMap.get(dep.element);
                    if(ctlSet) {
                        ctlSet.delete(this.node);
                        ctlSet.size || eleMap.delete(dep.element);
                        eleMap.size || this.dpMap.delete(dep.data);
                    }
                }
            })
        }
	
        depend(data, element) {
            if(this.node) {
                var e = this.dpMap.get(data);
                e || this.dpMap.set(data, e = new Map());
                var l = e.get(element);
                l || e.set(element, l = new Set());
                if(!l.has(this.node)) {
                    l.add(this.node);
                    this.dependencies.push({data : data, element : element});
                }
            }
        }

        notify(data, element, action, d1) {
            let e, s;
            (e = this.dpMap.get(data)) && (s = e.get(element)) && s.forEach(function (node) {
                node.notify({data : data, element : element, action : action, d1 : d1});
            });
            return true;
        }

        set(data, element, value, action) { 
            if(data[element] != value) { data[element] = value; this.notify(data, element, action, value) }; return true; 
        }
        get(data, element) { 
            this.depend(data, element); return data[element]; 
        }
    }
    
	//###############################################################################################################################
    
    class ProxyModel extends JsonProxy {
        constructor(proxy, runtime, node) {
            super(proxy.data, proxy.parents, proxy.elements, new DfeListener(runtime.listener.dpMap, node));
            this.persisted = proxy.persisted;
            this.$runtime = runtime;
            this.$node = node;
            this.unbound = proxy;
        }
        
        result(data) {
            this.$node.acceptLogic(data, this.$node.lastError);
        }
        
        error(error, data) {
            if( typeof data !== 'undefined' ) {
                this.$node.lastData = data;
            }
            if( this.$node.doValidation ) {
                if( error ) {
                    this.$node.stickyError = error;
                    this.$runtime.notifyErroring(this.$node);
                    this.$node.acceptLogic(this.$node.lastData, error);
                }
            }
            return error;
        }
        
        errorwatch(target, reducer) {
            let error = '';
            if(target === 'peers') {
                this.listener.get(this.$node.parent, 'erroringChildren').forEach(
                    node => this.hasChild(node.model) && (error = reducer ? reducer(error, node.lastError) : node.lastError)
                )
            } else {
                this.listener.get(target instanceof Node ? target : this.$node, 'erroringChildren').forEach(
                    node => error = reducer ? reducer(error, node.lastError) : node.lastError
                )
            }
            error && this.$node.acceptLogic(this.$node.lastData, error);
        }
        
        required(name, pattern, message) {
            var val = this.get(name);
            Array.isArray(val) && (val = val[0]);
            if( typeof val === 'undefined' || val.toString().replace(/ /g, '') === '' ) this.error(message || 'Required');
            else if( pattern === 'date' && !val.toString().match(arfDatePattern) || pattern && pattern !== 'date' && ! val.match(pattern) )
                     this.error(message || 'Invalid format');
                 else return true ;
        }
        
        destroy() {
            this.listener.undepend();
        }
    }

    //###############################################################################################################################

    let DOMEvents = [
        {name: 'onKeyDown', event: 'keydown'}, 
        {name: 'onKeyUp', event: 'keyup'}, 
        {name: 'onChange', event: 'change'}, 
        {name: 'onClick', event: 'click'}, 
        {name: 'onMouseOver', event: 'mouseover'},
        {name: 'onMouseEnter', event: 'mouseenter'}, 
        {name: 'onMouseLeave', event: 'mouseleave'}, 
        {name: 'onBlur', event: 'blur'}, 
        {name: 'onFocus', event: 'focus'}
    ];
    class DOM {   
        static reconcileAttributes(type, domElement, newAttributes, oldAttributes) {
            if(newAttributes.class != oldAttributes.class) {
                (newAttributes.class === undefined ? domElement.removeAttribute('class') : domElement.setAttribute('class', newAttributes.class));
            }
            if(newAttributes.style != oldAttributes.style ) {
                (newAttributes.style === undefined ? domElement.removeAttribute('style') : domElement.setAttribute('style', newAttributes.style));
            }
            if(newAttributes.id != oldAttributes.id) {
                (newAttributes.id === undefined ? domElement.removeAttribute('id') : domElement.setAttribute('id', newAttributes.id));
            }
            if(newAttributes.name != oldAttributes.name) {
                (newAttributes.name === undefined ? domElement.removeAttribute('name') : domElement.setAttribute('name', newAttributes.name));
            }
            DOMEvents.forEach( e => {
                if(newAttributes[e.name] != oldAttributes[e.name]) {
                    typeof oldAttributes[e.name] === 'function' && domElement.removeEventListener(e.event, oldAttributes[e.name], false);
                    typeof newAttributes[e.name] === 'function' && domElement.addEventListener(e.event, newAttributes[e.name], false);
                }
            })
            if( typeof newAttributes.events === 'object' || typeof oldAttributes.events === 'object' ) {
                let newEvents = newAttributes.events||0, oldEvents = oldAttributes.events||0;
                DOMEvents.forEach( e => {
                    if(newEvents[e.name] != oldEvents[e.name]) {
                        typeof oldEvents[e.name] === 'function' && domElement.removeEventListener(e.event, oldEvents[e.name], false);
                        typeof newEvents[e.name] === 'function' && domElement.addEventListener(e.event, newEvents[e.name], false);
                    }
                })
            }
            if( typeof newAttributes.domAttributes === 'object' || typeof oldAttributes.domAttributes === 'object' ) {
                let newDomAttributes = newAttributes.domAttributes||{}, oldDomAttributes = oldAttributes.domAttributes||{};
                Object.getOwnPropertyNames(newDomAttributes).forEach(
            		prop => newDomAttributes[prop] == oldDomAttributes[prop] || ( newDomAttributes[prop] === undefined ? domElement.removeAttribute(prop) : domElement.setAttribute(prop, newDomAttributes[prop])  )  
        		)
        		Object.getOwnPropertyNames(oldDomAttributes).forEach(prop => newDomAttributes.hasOwnProperty(prop) || domElement.removeAttribute(prop));
            }
            if(newAttributes.html != oldAttributes.html) {
                if(oldAttributes.html) {
                    while(domElement.firstChild) {
                        domElement.removeChild(domElement.firstChild); 
                    }
                }
                let html = newAttributes.html, isArray = Array.isArray(html);
                html = isArray ? html.filter(e => !!e) : html;
                if( html && html != 0) {
                    if( isArray ) {
                        html[0].nodeName ? html.forEach(node => domElement.appendChild(node)) : (domElement.innerHTML = html.join(''));
                    } else {
                        html.nodeName ? domElement.appendChild(html) : domElement.innerHTML = html.toString();
                    }
                }
            }
            if(newAttributes.disabled !== oldAttributes.disabled) {
                domElement.disabled = !!newAttributes.disabled;
            }
            switch(type) {
                case '#text':
                    newAttributes.text == oldAttributes.text || (domElement.nodeValue = newAttributes.text);
                    break;
                case 'input':
                case 'textarea':
                    if(newAttributes.type !== oldAttributes.type ) {
                        newAttributes.type === undefined ? domElement.removeAttribute("type") : domElement.setAttribute("type", newAttributes.type);
                    }
                    if(newAttributes.type !== 'checkbox' && newAttributes.type !== 'radio') {
                        if(domElement.value != newAttributes.value) {
                            if(document.activeElement === domElement) {
                                //TODO - if it s between "keydown" and "keyup" - delay? update / don't update
                                /*let s = domElement.selectionStart, e = domElement.selectionEnd;
                                domElement.value = newAttributes.value;
                                domElement.selectionStart = s;
                                domElement.selectionEnd = e;*/
                            } else {
                                domElement.value = newAttributes.value;
                            }
                        }
                    } else {
                        domElement.checked = newAttributes.checked;
                    }
                    break ;
                case 'label':
                    newAttributes.text == oldAttributes.text || (domElement.innerText = newAttributes.text);
                    break;
                case 'select':
                    newAttributes.selectedIndex == oldAttributes.selectedIndex || (domElement.selectedIndex = newAttributes.selectedIndex);
                    break ;
                case 'option':
                    newAttributes.text == oldAttributes.text || (domElement.text = newAttributes.text);
                    newAttributes.value == oldAttributes.value || (domElement.value = newAttributes.value);
                    break ;
                case 'th':
                case 'td':
                    newAttributes.colSpan == oldAttributes.colSpan || (domElement.colSpan = newAttributes.colSpan||1);
                    newAttributes.rowSpan == oldAttributes.rowSpan || (domElement.rowSpan = newAttributes.rowSpan||1);
                    break ;
                case 'form':
                    if(newAttributes.action != oldAttributes.action) {
                        (newAttributes.action === undefined ? domElement.removeAttribute('action') : domElement.setAttribute('action', newAttributes.action));
                    }
                    if(newAttributes.method != oldAttributes.method) {
                        (newAttributes.method === undefined ? domElement.removeAttribute('method') : domElement.setAttribute('method', newAttributes.method));
                    }
                    if(newAttributes.target != oldAttributes.target) {
                        (newAttributes.target === undefined ? domElement.removeAttribute('target') : domElement.setAttribute('target', newAttributes.target));
                    }
                    break ;
                case 'iframe':
                    if(newAttributes.src != oldAttributes.src) {
                        (newAttributes.src === undefined ? domElement.removeAttribute('src') : domElement.setAttribute('src', newAttributes.src));
                    }
                    break ;
            }
        }
        
        static batchRender(nodes) {
            nodes.forEach(node => node.render(node.lastData, node.lastError, node.attributes));
        }
        
        static getDOMContent(node) {
            let exploreContent = (content, nodes) => content.forEach(st => st.childNode instanceof Node || (nodes.push(st.dom), exploreContent(st.children, nodes)))
            let ret = [];
            node.lastRenderStructure.filter(lrs => lrs.dom).forEach(st => (ret.push(st.dom), exploreContent(st.content, ret)));
            return ret;
        }
        
        static nodeFromElement(domElement) {
            function isChildOf(parentElement) {
                if( parentElement ) {
                    for(let e = domElement; e; e = e.parentElement) {
                        if(e === parentElement) {
                            return true;
                        }
                    }
                }
                return false;
            }
            let runtime = null, prnt = domElement;
            while(!runtime && prnt) {
                runtime = prnt._dfe_runtime;
                prnt = prnt.parentNode;
            }
            if( runtime ) {
                let ret = null;
                runtime.nodes.concat().reverse().filter(node => node.isAttached()).forEach(node => ret || DOM.getDOMContent(node).some(isChildOf) && (ret = node));
                return ret;
            }
            return null;
        }
        
        static makeKeyMap(renderStructure, lastRenderStructure) {
            if( renderStructure.length > 1 && lastRenderStructure.length > 1 && typeof lastRenderStructure[0].key !== 'undefined' ) {
                let keyMap = new Map(), info;
                lastRenderStructure.forEach(
                    lst => (info = keyMap.get(lst.key)) ? info.nodes.push(lst) : keyMap.set( lst.key, {lrs: 0, nodes: [lst]} )
                )
                return renderStructure.map(st => (info = keyMap.get(st.key)) && info.nodes[ info.lrs++ ]);
            }
        }
    }
    
    class Component {
        constructor(node){
            this.$node = node;
        }
        destroy() {
        }
        update() {
            this.$node.notify(); 
        }
        doValidation(events, attrs) {
            return false;
        }
        store(value, method) {
            this.$node.store(value, method);
        }
        render(data, error, attributes, children) {
            let sub = [];
            children.forEach(
                map => map.forEach( 
                    child => sub.push( child ) 
                )
            )
            return sub;
        }
        onUpdate(data, error, attributes) {
            
        }
    }
    
    class Field {
        constructor(clazz, ...args) {
            let index = 1, parameters = {}, children = [], name;
            if( ! (clazz.prototype instanceof Component) ) {
                throw 'Must specify Component class';
            }
            if(typeof arguments[1] === 'string') {
                name = arguments[1];
                index++;
            }
            let next = arguments[index];
            if( typeof next === 'object' && !Array.isArray(next) && !(next instanceof Field) ) {
                parameters = next;
                index++;
            }
            for(let i = index; i < arguments.length; i++) {
                next = arguments[i];
                (Array.isArray(next) ? next : [next]).forEach(arg => (arg instanceof Field) && children.push(arg));
            }
            let staticTest = field => field.class && typeof field.class === 'string';
            Object.assign( this, parameters, { component: clazz, name: name, children: children })
        }
    }
    
    class Form extends Component {
        static field(clazz, ...args) {
            let field = new Field(clazz, ...args);
            if( clazz.prototype instanceof Form ) {
                field.children = clazz.fields(field.children, field.config||{})||[];
                Array.isArray(field.children) || ( field.children = [field.children] );
                // Not quite sure about this.
                if( field.layout ) {
                    field.layout.forEach((layout, i) => field.children[i] && (field.children[i].layout = Array.isArray(layout) ? layout : [layout] ))
                }
            }
            return field;
        }
        static fields (children, field) {
            return children||[] 
        }
    }

    function completeNames(fields) {
        let fieldIndex = 0;
        (Array.isArray(fields) ? fields : [fields]).forEach( 
            field => {
                field.name || (field.name = field.component.name + '#' + (++fieldIndex) );
                completeNames(field.children);
            }
        );
        return fields;
    }
    
    function createElement(type, attributes, children) {
        if(typeof attributes !== 'object') {
            return { type: type, key: type, attributes: {}, children: [] }
        }
        if(attributes instanceof Node) {
            return { type: type, key: attributes.key, childNode: attributes, attributeMapper: children }
        } else {
            // attributes may have get, set, val, ref and key ... and bunch of stuff meant to put in dom
            return { type: type, ref: attributes.ref, key: attributes.key||type, attributes: attributes||{}, children: children||[] }
        }
    }
    
    class Node {
        constructor(parent, field, unboundModel, runtime) {
            Object.assign(this, {
                parent: parent,
                runtime: runtime,
                form: null,
                field: field,
                control: null,
                notifications : [],
                children : new Map(),
                erroringChildren : new Set(),
                lastData: undefined,
                lastError: undefined,
                attributes: {},
                unboundModel: unboundModel,
                // rendering-related part
                elementInfo: null,
                $parentDom: null,
                $prevDom: null,
                $lastDom: null,
                $nextNode: null,
                $prevNode: null,
                $followingChildNode: null,
                shouldRender: false,
                lastRenderStructure: [],
                lastAttachedChildren: new Set()
            })            
            let control = new (field.component)(this);
            this.key = field.name + '-' + unboundModel.data.key;
            this.form = control instanceof Form ? control : parent.form;
            this.control = control;
            this.model = new ProxyModel(unboundModel, runtime, this);
            
            unboundModel.$node = this;
        }
        render(lastData, lastError, lastAttributes) {
            if( this.shouldRender && this.isAttached() ) {
                this.shouldRender = false;

                let { attributeMapper: mapper, ...rest} = lastAttributes;
                let renderStructure = this.control.render(lastData, lastError, rest, this.children);
                let attributes = this.field.layout||[], layoutIndex = 0;
                if( this.elementInfo.attributeMapper ) {
                    let f = mapper;
                    mapper = a => this.elementInfo.attributeMapper(f ? f(a) : a);
                }
                // The problem here is we have layout attributes of container, but we can't pass its portion to children because there s no telling what s their size. 
                // if we were to calculate current size, every time child moves or its dimensions change it would need to notify all siblings to update their parent node attributes
                renderStructure = (Array.isArray(renderStructure) ? renderStructure : [renderStructure]).map(
                    st => st instanceof Node ? st : {
                        key: st && st.type || '0',
                        attributes: (mapper ? mapper(attributes[layoutIndex++]||{}) : attributes[layoutIndex++])||{},
                        dom: null, 
                        content: st
                    }
                )
                let lrs = 0, tail = this.$prevDom, prevNode = null, followingChildNode = null, keyMap = DOM.makeKeyMap(renderStructure, this.lastRenderStructure);
                let attachedChildren = new Set();
                this.lastRenderStructure.forEach( lst => lst.used = false );
                for(let rs = 0; rs < renderStructure.length; rs++) {
                    let st = renderStructure[rs]; 
                    let lst = keyMap ? keyMap[rs] : this.lastRenderStructure[lrs];
                    let use = st === lst || lst && !(st instanceof Node || lst instanceof Node);
                    if( use ) {
                        lst.used = true ;
                        lrs++;
                    }
                    if( st instanceof Node ) {
                        followingChildNode || (followingChildNode = st);
                        tail = st.setDom(this.elementInfo, this.$parentDom, tail);
                        attachedChildren.add(st);
                        prevNode && (prevNode.$nextNode = st), st.$prevNode = prevNode, prevNode = st;
                    } else {
                        st.dom = tail = use ? lst.dom : this.$parentDom.insertBefore(
                            document.createElement(this.elementInfo.type), tail ? tail.nextSibling : this.$parentDom.firstChild
                        );
                        DOM.reconcileAttributes(this.elementInfo.type, st.dom, st.attributes, use ? lst.attributes : {});
                        st.content = this.applyInPlace(st.dom, st.content, use ? lst.content : [], attachedChildren);
                        use || st.attributes.ref && st.attributes.ref(st.dom);
                    }
                }
                prevNode && (prevNode.$nextNode = null);
                tail === this.$lastDom || this.adjustLastDom(tail);
                this.lastRenderStructure.forEach( lst => lst.used || lst instanceof Node || this.$parentDom.removeChild(lst.dom) );
                this.lastAttachedChildren.forEach( child => attachedChildren.has(child) || child.setDom(null, null, null) );
                this.lastAttachedChildren = attachedChildren;
                this.$followingChildNode = followingChildNode;
                this.lastRenderStructure = renderStructure;
            }
        }
        adjustLastDom(tail) {
            if(tail !== this.$lastDom) {
                if( this.parent && this.parent.$lastDom === this.$lastDom) {
                    this.parent.adjustLastDom(tail);
                }
                if(this.$nextNode && this.$nextNode.$prevDom === this.$lastDom) {
                    this.$nextNode.adjustPrevDom(tail);
                }
                this.$lastDom = tail;
            }
        }
        adjustPrevDom(head) {
            if(head !== this.$prevDom) {
                if(this.$followingChildNode && this.$followingChildNode.$prevDom === this.$prevDom) {
                    this.$followingChildNode.adjustPrevDom(head)
                }
                if(this.$lastDom === this.$prevDom) {
                    this.adjustLastDom(head);
                }
                this.$prevDom = head;
            }
        }
        applyInPlace(domElement, renderStructure, lastRenderStructure, attachedChildren) {
            renderStructure = (Array.isArray(renderStructure) ? renderStructure : [renderStructure]).map(
                st => typeof st === 'string' ? { type: '#text', attributes: {text: st}, children: [] } : st
            ).filter( st => st && st.type );
            
            let prev = null, prevNode = null, keyMap = DOM.makeKeyMap(renderStructure, lastRenderStructure);
            lastRenderStructure.forEach( lst => lst.used = false );
            for(let lrs = 0, rs = 0; rs < renderStructure.length; rs++) {
                let st = renderStructure[rs]; 
                if( st instanceof Node ) {
                    throw "Component can't be mounted in a fixed-width node"
                }
                if( typeof st === 'string' ) {
                    renderStructure[rs] = st = { type: '#text', attributes: {text: st.toString()}, children: [] }
                }

                let lst = keyMap ? keyMap[rs] : lastRenderStructure[lrs], child = st.childNode;
                let use = lst && !lst.used && st.type === lst.type && child === lst.childNode; // this should never happen && !attachedChildren.has(child);
                if( use ) {
                    lst.used = true ;
                    lrs++;
                }
                if( child !== undefined ) {
                    prev = child.setDom(st, domElement, prev);
                    attachedChildren.add(child);
                    prevNode && (prevNode.$nextNode = child), child.$prevNode = prevNode, prevNode = child;
                } else {
                    st.dom = use ? lst.dom : st.type === '#text' ? document.createTextNode('') : document.createElement(st.type);
                    prev = prev ? prev.nextSibling : domElement.firstChild;
                    if(prev !== st.dom) {
                        prev = domElement.insertBefore(st.dom, prev);
                    }
                    st.children = this.applyInPlace(st.dom, st.children, use ? lst.children : [], attachedChildren);
                    DOM.reconcileAttributes( st.type, st.dom, st.attributes, use ? lst.attributes : {} );
                    use || st.attributes.ref && st.attributes.ref(st.dom);
                }
            }
            prevNode && (prevNode.$nextNode = null);
            lastRenderStructure.forEach( lst => lst.used || lst.childNode || lst.dom.parentNode.removeChild(lst.dom) );
            return renderStructure;
        }
        setDom( elementInfo, parentDom, prevDom ) {
            let updateAttributes = false, prev = prevDom, layoutIndex = 0, attributeMapper;
            if( parentDom ) {
                if( updateAttributes = !this.shouldRender ) {
                    let m1 = this.attributes.attributeMapper, m2 = elementInfo.attributeMapper;
                    attributeMapper = m1 && m2 ? a => m2(m1(a)) : m1 ? m1 : m2;
                }
                if( this.elementInfo && elementInfo.type !== this.elementInfo.type ) {
                    throw 'Unsupported';
                }
            } else {
                this.$nextNode = this.$prevNode = null;
            }
            this.lastRenderStructure.forEach(lst => {
                if(lst instanceof Node) {
                    prev = lst.setDom( elementInfo, parentDom, prev );
                } else {
                    if( parentDom ) {
                        prev = prev ? prev.nextSibling : this.$parentDom === parentDom ? lst.dom : null;
                        if( lst.dom !== prev ) {
                            prev = parentDom.insertBefore( lst.dom, prev );
                        }
                        if(updateAttributes) {
                            let attributes = this.field.layout && this.field.layout[layoutIndex++] || {};
                            attributeMapper && (attributes = attributeMapper(attributes));
                            DOM.reconcileAttributes(elementInfo.type, lst.dom, attributes, lst.attributes);
                            lst.attributes = attributes;
                        }
                    } else {
                        this.$parentDom && this.$parentDom.removeChild(lst.dom);
                    }
                }
            })
            this.elementInfo = elementInfo;
            this.$prevDom = prevDom;
            this.$lastDom = prev;
            this.$parentDom = parentDom;
            return prev;
        }
        isAttached() {
            let node = this;
            for(; node && node.$parentDom; node = node.parent) ;
            return !node;
        }
        notify(action) {
            this.notifications.push(action || { action : 'self' });
            this.runtime.shouldAnythingRender = true;
        }
        store(value, method) {
            let setter = this.field.set || this.attributes.set;
            typeof setter === 'function' && setter.call(this.form, this.unboundModel, value, method);
        }
        acceptLogic(data, error) {
            let childrenFields = this.field.children;
            if(typeof data !== 'undefined' && !this.evicted) {
                if(childrenFields.length) {
                    data = (Array.isArray(data) ? data : typeof data === 'object' ? [data] : []).map(
                        d => d instanceof JsonProxy ? d : new JsonProxy(d)
                    );
                    this.runtime.reconcileChildren(this, data);
                }
                this.lastData = data;
                this.lastError = error;                
                this.shouldRender = true;
                this.runtime.shouldAnythingRender = true;
                this.control.onUpdate(data, error, this.attributes);
            }
        }
    }
    
	class Runtime {
        constructor(config, listener) {
            this.config = config || {};
            this.schedule = [];
            this.listener = new DfeListener(listener instanceof DfeListener && listener.dpMap); 
            this.nodes = [];
            this.shouldAnythingRender = false;
            this.pendingLogic = new Set();
        }
        setDfeForm(formClass) {
            this.formClass = formClass;
            return this;
        }
        setModel(model) {
            this.rootProxy = (model instanceof JsonProxy ? model : new JsonProxy(model)).withListener(this.listener);
            return this;
	    }
		stop() {
            this.processor && clearInterval(this.processor); 
        }
	    shutdown() { 
            this.processor && clearInterval(this.processor);
            if(this.nodes.length) {
                let root = this.nodes[0];
                root.isAttached() && root.setDom(null, null, null);
	            this.evict(root);
                this.removeEvicted();
            }
            this.processor = null;
        }
        restart(parentElement, initAction, interval) {
            parentElement || this.nodes.length && ( parentElement = this.nodes[0].$parentDom );
	        this.shutdown();
            this.initAction = {action: initAction||'init'};
            if( this.rootProxy && this.formClass ) {
                parentElement && (parentElement._dfe_runtime = this);
                let node = this.addNode( null, this.rootProxy, new Field( this.formClass, completeNames( this.formClass.fields([], this.config) ) ) );
                node.setDom({ type: 'div' }, parentElement, null);
	            this.processor = setInterval(() => this.processInterceptors(), interval||50);
                this.processInterceptors();
            }
            return this;
	    }
        enforceValidation() {
            this.nodes.forEach(node => node.notifications.push({action: 'validate'}));
            this.shouldAnythingRender = true;
        }
        setRoot(parentElement, afterNode) {
            let node = this.nodes[0];
            node && node.setDom(node.elementInfo, parentElement, afterNode||null);
        }
        processInterceptors() {
            if(this.shouldAnythingRender) {
                this.shouldAnythingRender = false;
                for(let i = 0; i < this.nodes.length; i++) {
                    this.logic(this.nodes[i]);
                }
                this.removeEvicted();
                DOM.batchRender(this.nodes);
            }
            while(this.schedule.length) this.schedule.shift()(this);
        }
        addNode(parent, modelProxy, field) {
            let unbound = modelProxy.withListener(this.listener); //Object.assign(path => unbound.get(path), JsonProxy.prototype, modelProxy, {listener: this.listener});
            let node = new Node(parent, field, unbound, this);
            node.notify(this.initAction);
            this.nodes.push(node);
            return node;
        }
        removeErroring(node) {
            if( node.lastError ) {
                delete node.lastError;
                for( let cur = node.parent; cur && cur.erroringChildren.delete(node); cur = cur.parent ) {
                    this.listener.notify(cur, 'erroringChildren');
                }
            }
        }
        notifyErroring(node) {
            for( let cur = node.parent; cur && !cur.erroringChildren.has(node); cur = cur.parent ) {
                cur.erroringChildren.add(node), this.listener.notify(cur, 'erroringChildren', 'validate'); 
            }
        }
        evict(node) {
            this.removeErroring(node);
            node.evicted = true;
            node.children.forEach(fieldMap => fieldMap.forEach( node => this.evict(node)));
            node.control.destroy();
            node.model.destroy();
            if(node.parent) {
                let fieldMap = node.parent.children.get(node.model.data);
                if(fieldMap) {
                	fieldMap.delete(node.field);
                	fieldMap.size || node.parent.children.delete(node.model.data);
                }
                node.parent = null;
            }
        }
        removeEvicted() {
            let cur = 0;
            this.nodes.forEach( node => node.evicted || (this.nodes[cur++] = node) );
            this.nodes.splice(cur);
        }
        reconcileChildren(parent, rowProxies) {
            // TODO... 
            let childFields = parent.field.children;
            let ownModel = parent.model.unbound;
            let lastChildren = parent.children;
            if( lastChildren.size || childFields.length ) {
                var rows = new Map(), rkeys = new Set(), fkeys = new Set(), skeys = new Set(), i=0, m, present, a, f, n, c, d; 
                lastChildren.forEach((v, k) => k ? (rkeys.add(k), i++||v.forEach((_, f) => fkeys.add(f))) : v.forEach((_, f) => skeys.add(f)) );
                (childFields||[]).forEach(d => { (typeof d['class'] == 'string' && d['class']!=''?skeys:fkeys).add(d) });
                (rowProxies||[]).forEach(r => { rows.set(r.data, r); rkeys.add(r.data)});
                rkeys.forEach( r => { 
                    (m = lastChildren.get(r))||lastChildren.set(r, m = new Map()); 
                    present = rows.get(r); 
                    fkeys.forEach(function(k) {
                        c = m.get(k);
                        present ? c || m.set(k, this.addNode(parent, present, k)) : c && this.evict(c);
                    }, this);
                    m.size || lastChildren['delete'](r);
                });
                m = lastChildren.get(null)||new Map();
                skeys.forEach(k => {
                    c = m.get(k);
                    c || m.set(k, this.addNode(parent, ownModel, k));
                });
                m.size ? lastChildren.set(null, m) : lastChildren['delete'](null);
            }
        }
        logic(node) {
            if(node.notifications.length && !node.evicted) {
                var events = node.notifications;
                node.notifications = [];
                try {
                    var m = node.model, d = node.field, v, fg, fv;
                    //m.events = events;
                    let attrs = node.attributes = typeof d.atr === 'function' && d.atr.call(node.form, m) || {};
                    node.doValidation = !!(attrs.errorwatch || node.control.doValidation(events, attrs));
                    this.removeErroring(node);
                    typeof (v = typeof (fg = d.get || attrs.get) != 'function' ? [m] : fg.call(node.form, m, events)) == 'undefined' || m.result(v);
                    if(attrs.errorwatch) {
                        let { target: target, accept: reducer } = attrs.errorwatch;
                        m.errorwatch(target, reducer);
                    } else {
                        node.doValidation && typeof (fv = d.val || attrs.val) == 'function' && fv.call(node.form, m, events);
                    }
                } catch(e) { 
                    node.doValidation = 1; try{ node.model.error(e.message) } catch (e) { } console.error(node.field + '\n' + e.message + '\n' + e.stack); 
                }
            }
        }
        findChildren(nodes, deep, includeSelf, field, model) {
            let ret = [];
            function traverse(control) { 
                control.children.forEach(
                    map => map.forEach(
                        node => {
                            (!field || node.field.name === field) && (!model || node.model.data === model.data ) && ret.push(node); 
                            deep === false || traverse(node);
                        }
                    )
                )
            }
            (Array.isArray(nodes) ? nodes : [nodes]).forEach( node => { 
                includeSelf && (!field || node.field.name === field) && (!model || node.model.data === model.data ) && ret.push(node); 
                traverse(node); 
            });
            return ret;
        }
        findNodes(fields, modelProxy) {
            return this.nodes.filter( node => array.indexOf(node.field.name) !== -1 && (!modelProxy || node.model.data == modelProxy.data ) );
        }	
        static startRuntime(args) {
            let {model: model, form: form, node: node, listener: listener, config: config, initAction: initAction, ready: ready} = args;
            let runtime = new Runtime(config, model instanceof JsonProxy && model.listener);
            typeof ready === 'function' && runtime.schedule.push( ready.bind(null, runtime, args) )
            runtime.setModel(model).setDfeForm(form).restart(node, initAction);
            return runtime;
        } 
	}
	return { 
        JsonProxy: JsonProxy, 
        Form: Form, 
        Runtime: Runtime, 
        startRuntime: Runtime.startRuntime,
        createElement: createElement,
        nodeFromElement: DOM.nodeFromElement,
        getDOMContent: (node, includeLayout) => {
            let all = DOM.getDOMContent(node);
            return includeLayout ? all : all.filter(dom => dom.parentNode !== node.$parentDom)
        },
        createNode: (...args) => new Node(...args),
        reconcileDOMAttributes: DOM.reconcileAttributes,
        Component: Component
    }
});

define('core-validation-component', ['dfe-core'], Core => 
    class CoreValidationComponent extends Core.Component {
        doValidation(events, attrs) {
            let vs = (attrs.vstrategy||'').split(' ');
            delete attrs.vstrategy;
            if( vs.indexOf('none') != -1 || vs.indexOf('disabled') == -1 && (attrs.disabled || attrs.hidden) ) {
                return false;
            }
            if( this.$node.lastError ) {
                return true;
            } 
            if( vs.indexOf('always') != -1 || vs.indexOf('followup') != -1 && this.$node.stickyError ) {
                return true;
            }
            if( vs.indexOf('notified') != -1 && events[0].action != 'init' ) {
                return true;
            }
            return events.some(e => 'validate' === e.action); 
        }
    }
)

/*  TODO: idk about this. it s tempting to run delayed response based on promises but then we'll lose $$.required and $$.error features. probably

        acceptLogic(data, error) {
            error = error === undefined || error === null ? '' : error.toString();
            if( typeof data !== 'undefined' && !this.evicted && (data !== this.lastData || error !== this.lastError) ) {
                this.lastData = data;
                if( this.field.children.length ) {
                    data = (Array.isArray(data) ? data: typeof data == 'object' ? [data] : []).map(d => typeof d.withListener == 'function' ? d : new JsonProxy(d));
                    this.runtime.reconcileChildren(this, data);
                }
                this.lastError = error;                
                this.shouldRecalculateRenderStructure = true;
            }
        }
        static acceptError(node, payload) {
            if(Array.isArray(payload)) {
                let {data, error} = payload.reduce( (out, cur) => typeof cur === 'object' ? { data: cur.data || out.data, error: cur.error || out.error } : { data: out.data, error: cur && cur.toString() || out.error }, {} )
                node.acceptLogic( data || node.lastData, error );
            } else {
                typeof payload === 'object' ? node.acceptLogic(payload.data, payload.error) : node.acceptLogic(node.lastData, payload);
            }
        }
		
		logic(node) {
            if(node.notifications.length && !node.evicted) {
                var events = node.notifications;
                node.notifications = [];
                try {
                    let attributes = node.attributes = typeof node.field.atr === 'function' && node.field.atr.call(node.form, node.model) || {}
                    let getter = node.field.get || attributes.get;
                    let validate = node.field.val || attributes.val;
                    let doValidation = typeof validate === 'function' && node.control.doValidation(events, attributes);
                    let result = typeof getter === 'function' ? getter.call(node.form, node.model, events) : [node.model];
                    let error;
                    if(attributes.errorwatch) {
                        let { target: target, accept: reducer } = attributes.errorwatch;
                        error = node.model.errorwatch(target, reducer);
                    } else {
                        error = doValidation && typeof validate === 'function' && validate.call(node.form, node.model, events) || '';
                    }
                    if( result instanceof Promise ) {
                        this.pendingLogic.add(result);
                        result.then( data => node.acceptLogic(data, node.lastError), node.acceptError ).then(() => this.pendingLogic.delete(result));
                    } else {
                        node.acceptLogic(result, node.lastError);
                    }
                    if( error instanceof Promise ) {
                        this.pendingLogic.add(error);
                        error.then(node.acceptError, node.acceptError).then(() => this.pendingLogic.delete(error));
                    } else {
                        node.acceptError(error);
                    }
                } catch(e) { 
                    node.acceptError(e.message);
                    console.error('Unhandled error', node.field, e.message, e.stack); 
                }
            }
        }

*/


