define('dfe-for-react', ['React'], function(React){
    return (function(){
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

        DfeListener.prototype.undepend = function(data, element){
            if(this.control) {
                var e = this.dpMap.get(data);
                if(e) { 
                    var l = e.get(element);
                    if(l) {
                        l.delete(this.control);
                        l.size || e.delete(element);
                        e.size || this.dpMap.delete(data);
                    }
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

        var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

        function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

        function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

        function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

        var RootComponent = function (_React$Component) {
            _inherits(RootComponent, _React$Component);

            function RootComponent(props) {
                _classCallCheck(this, RootComponent);

                var _this = _possibleConstructorReturn(this, (RootComponent.__proto__ || Object.getPrototypeOf(RootComponent)).call(this, props));
                _this.__parent = props.listener ? props.listener.control : null;
                _this.__dependencies = [];
                _this.__proxy = new JsonProxy(props.data, props.parents, props.elements, (props.listener || new DfeListener()).For(_this));
                _this.__erroringChildren = new Set();
                return _this;
            }

            _createClass(RootComponent, [{
                key: "componentWillUnmount",
                value: function componentWillUnmount() {
                    this.__dependencies.forEach(function (dep) {
                        this.__proxy.listener.undepend(dep.data, dep.element);
                    }, this);
                    for(var p = this.__parent; p; p = p.__parent) {
                        p.__erroringChildren.delete(this);
                        p.__proxy.listener.notify(p.__erroringChildren, 'errors');
                    }
                    this.__dependencies = [];
                }
            }, {
                key: "validate",
                value: function validate() { 
                    // TODO: ability to lookup multiple steps up
                    if(this.props.errorwatch) {
                        var ref = this.__proxy.data, msg;
                        this.__proxy.listener.depend(this.__parent.__erroringChildren, 'errors');
                        this.__parent.__erroringChildren.forEach(function(control) {
                            for(var px = control.__proxy.parents.concat(control.__proxy), i = px.length-1; i>=0; i-- )
                                if(px[i].data == ref) {
                                    msg = 'error';
                                    break ;
                                }
                        })
                        return msg;
                    }
                }
            }, {
                key: "get",
                value: function get(path) {
                    return this.__proxy.get(path);
                }
            }, {
                key: "set",
                value: function set(path, value) {
                    return this.__proxy.set(path, value);
                }
            }, {
                key: "append",
                value: function append(path, defaults) {
                    return this.__proxy.append(path, defaults);
                }
            }, {
                key: "__innerValidationProcessor",
                value: function __innerValidationProcessor() {
                    // TODO: vanilla screen, aka only error on certain event at first, and then only error if errored on previous render cycle, or based on this.props.vstrategy
                    var curErr = this.__erroringMessage;
                    delete this.__erroringMessage;
                    var msg = this.validate();
                    if(!this.props.errorwatch && (!curErr)^(!msg) ) {
                        var _this = this;
                        setTimeout(function() {
                            for(var p = _this.__parent, f = msg ? 'add' : 'delete'; p; p = p.__parent) {
                                p.__erroringChildren[f](_this);
                                p.__proxy.listener.notify(p.__erroringChildren, 'errors');
                            }
                        }, 10);
                    }
                    msg && (this.__erroringMessage = msg);
                }
            }, {
                key: "errorMessage",
                value: function errorMessage() {
                    this.__innerValidationProcessor();
                    return this.__erroringMessage && React.createElement(
                        "span",
                        { "className": "dfe-error-message" },
                        this.__erroringMessage
                    );
                }
            }]);

            return RootComponent;
        }(React.Component);

        return {
            Proxy: JsonProxy,
            Component: RootComponent,
            Listener: DfeListener
        }
    })()
})

/*
babel.transform(`class RootComponent extends React.Component {
            constructor(props) {
                super(props);
                this.__dependencies = [];
                this.__proxy = new JsonProxy(props.data, props.parents, props.elements, (props.listener||new DfeListener()).For(this));
            }

            componentWillUnmount() {
                this.__dependencies.forEach(function(dep) { this.__proxy.listener.undepend(dep.data, dep.element) }, this);
                this.__dependencies = [];
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
        }`,{presets: ["es2015","react"]}).code
*/