let Dfe = (function(){
	function __extend(from, to) { for (var key in from) { var v = from[key]; to[key] = (typeof v === 'object' && (v = __extend(v, Array.isArray(v) ? [] : {}, 1)) || v) } return to; }
    
    function JsonProxy(data, parents, elements, listener) {
        this.parents = (parents || []);
        this.elements = (elements || []);
        this.data = data||{};
        this.persisted = data;
        this.listener = listener;
        this.key = this.data.key || (this.data.key = ++JsonProxy.key);
        if(this.parents.length != this.elements.length) throw 'Oops';
    }

    JsonProxy.key = 0;

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
	            this.control.__dependencies.push({data : data, element : element});
	        }
	    }
	}
	
	DfeListener.prototype.For = function(control) {
		return new DfeListener(this.dpMap, control);
	}
	
	DfeListener.prototype.notify = function(data, element, action, d1) {
	    var e, s;
	    (e = this.dpMap.get(data)) && (s = e.get(element)) && s.forEach(function (cc) {
	        cc.forceUpdate();
	    });
	    return true;
	}
    
    class RootComponent extends React.Component {
        constructor(props) {
            super(props);
            this.__dependencies = [];
            this.__proxy = new JsonProxy(props.data, props.parents, props.elements, (props.listener||new DfeListener()).For(this));
        }
        
        componentWillUnmount() {
            /*let dpMap = this.__proxy.listener.dpMap;
            this.__dependencies.forEach(function(dep) {
                let eleMap = dpMap.get(dep.data);
                if(eleMap) { 
                    let ctlSet = eleMap.get(dep.element);
                    if(ctlSet) {
                        ctlSet.delete(this);
                        ctlSet.size || eleMap.delete(dep.element);
                        eleMap.size || dpMap.delete(dep.data);
                    }
                }
            });*/
        }
        
        validate() { // : string
            // todo
        }

        get(path) {
            return this.__proxy.get(path);
        }
        
        set(path, value) {
            return this.__proxy.set(path, value);
        } 
        
        append(path, defaults) {
            return this.__proxy.append(path, defaults);
        }
    }
    
    return {
        Proxy: JsonProxy,
        Component: RootComponent,
        Listener: DfeListener
    }
})()

//=============================================================================================

class EditableRow extends Dfe.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            originalValue: this.get(this.props.field)
        }
    }
    componentDidUpdate() {
        this.input && this.input.focus();
    }

    closeInput(store) {
        if(store) {
            this.set(this.props.field, this.input.value);
            this.setState({ edit: false, originalValue: this.input.value })
        } else {
            this.set(this.props.field, this.state.originalValue);
            this.setState({ edit: false })
        }
    }

    handleOnKeyDown(e) {
        e.key == 'Enter' && this.closeInput(true);
        e.key == 'Escape' && this.closeInput(false);
    }

    render() {
        return this.state.edit ? <input 
                                      ref={e => this.input = e} 
                                      defaultValue={ this.state.originalValue } 
                                      onChange={e => this.set(this.props.field, e.target.value)}
                                      onBlur={ this.closeInput.bind(this, true) }  
                                      onKeyDown={e => this.handleOnKeyDown(e) }
                                  /> :  
                <span onClick={e => this.setState({edit: true})}>{this.get(this.props.field)}</span> 
    } 
}

class ShoppingList extends Dfe.Component {
    render() {
        let rows = this.get('cart');
        return (
            <div className="shopping-list">
                <h1> Shopping List for {this.get('.name')} </h1>
                <h4> Reference value: {rows[0].get('.value')} </h4>
                <ul>
                    { 
                        rows.map(item => 
                            <li key={item.data.key}>
                                <EditableRow {...item} field={'.value'}/>
                                { rows.length > 1 && <button onClick={() => item.detach()}>Delete</button> }
                            </li> 
                        ) 
                    }  
                </ul>
                <button onClick={() => this.append('cart', {value: 'Yes I want some !new face!'}) }>Add new record</button>
            </div>
        );
    }
}

ReactDOM.render( <ShoppingList {...new Dfe.Proxy({name: 'Mark', cart: [{value: 'Instagram'}, {value: 'WhatsApp'}, {value: 'Oculus'}]}) }/>, 
                     document.getElementById('react') );