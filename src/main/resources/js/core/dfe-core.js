'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define('dfe-core', ['dfe-dom'], function (document) {
    var arfDatePattern = /^(18|19|20)((\\d\\d(((0[1-9]|1[012])(0[1-9]|1[0-9]|2[0-8]))|((0[13578]|1[02])(29|30|31))|((0[4,6,9]|11)(29|30))))|(([02468][048]|[13579][26])0229))$/;
    //deep
    function deepCopy(to, from) {
        Object.getOwnPropertyNames(from).forEach(function (key) {
            if (key !== 'key') {
                var v = from[key];
                to[key] = (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' ? deepCopy(Array.isArray(v) ? [] : {}, v) : v;
            }
        });
        return to;
    }

    var nextKey = 0;

    //###############################################################################################################################

    var JsonProxy = function () {
        function JsonProxy(data, parents, elements, listener) {
            _classCallCheck(this, JsonProxy);

            this.parents = parents || [];
            this.elements = elements || [];
            this.data = data || {};
            this.persisted = data;
            this.key = this.data.key || (this.data.key = ++nextKey);
            this.listener = listener;
            if (this.parents.length != this.elements.length) throw 'Oops';
        }

        _createClass(JsonProxy, [{
            key: 'toString',
            value: function toString() {
                return 'JsonProxy{' + this.elements.join('.') + '}';
            }
        }, {
            key: 'get',
            value: function get(path) {
                var sb = 0;
                if (!path) return this;
                if (path.charAt(0) == '.') {
                    var s = path.substr(1),
                        ret;
                    if (s.indexOf('.') == -1 && s.length > 0) {
                        ret = this.data[s];
                        this.listener && this.listener.depend(this.data, s);
                        if (ret && Array.isArray(ret)) {
                            var t = ret,
                                p = this.parents.concat(this),
                                e = this.elements.concat(s);ret = [];
                            t.forEach(function (d) {
                                ret.push(new JsonProxy(d, p, e, this.listener));
                            }, this);
                        }
                        return ret || [];
                    } else {
                        while (s.charAt(sb) == '.') {
                            sb++;
                        }var p = this.elements.slice(0, this.elements.length - sb).join('.');
                        path = p == '' ? s.substr(sb) : p + path.substr(sb);
                    }
                    if (sb == s.length) return this.parents.concat(this)[this.parents.length - sb];
                }
                var p = path.split('.'),
                    pa = this.parents.concat(this);
                if (path.length == 0) return [new JsonProxy(pa[0].data, [], [], this.listener)];
                var va = [pa[0]],
                    maintained = true;
                for (var i = 0; i < p.length && va.length > 0; i++) {
                    if (maintained && pa.length - sb > i + 1 && i < p.length - 1 && this.elements[i] == p[i]) {
                        va = pa[i + 1].data ? [pa[i + 1]] : [];
                    } else {
                        var nva = [],
                            e,
                            listener = this.listener;
                        va.forEach(function (px) {
                            if (px.data) {
                                if (listener) listener.depend(px.data, p[i]);
                                if (e = px.data[p[i]]) {
                                    if (Array.isArray(e)) {
                                        var pars = px.parents.concat(px),
                                            els = p.slice(0, i + 1);
                                        e.forEach(function (d) {
                                            nva.push((typeof d === 'undefined' ? 'undefined' : _typeof(d)) == 'object' ? new JsonProxy(d, pars, els, listener) : d);
                                        });
                                    } else {
                                        nva.push(e);
                                    }
                                }
                            }
                        });
                        if (maintained && i == p.length - 1 && nva.length) return Array.isArray(e) ? nva : nva[0] || [];
                        maintained = false;
                        va = nva;
                    }
                }
                return va;
            }
        }, {
            key: 'shadow',
            value: function shadow(path, defaults) {
                if (path.length == 0) {
                    return [];
                }
                if (path.charAt(0) == '.') {
                    path = this.elements.join('.') + path;
                }
                var p = path.split('.'),
                    me = this,
                    pa = this.parents.concat(this),
                    ret = void 0;
                for (var i = 0; i < p.length; i++) {
                    if (!(pa.length > i + 1 && this.elements[i] == p[i])) {
                        pa = pa.slice(0, i + 1);
                        for (var j = i + 1; j <= p.length; j++) {
                            pa = pa.concat(new JsonProxy(undefined, pa, p.slice(0, j), this.listener));
                        }ret = pa.pop();
                        break;
                    }
                }
                ret = ret || new JsonProxy(undefined, this.parents, p, this.listener);
                if ((typeof defaults === 'undefined' ? 'undefined' : _typeof(defaults)) === 'object') {
                    deepCopy(ret.data, defaults instanceof JsonProxy ? defaults.data : defaults);
                }
                if (typeof defaults === 'function' && defaults.data) {
                    deepCopy(ret.data, defaults.data);
                }
                return [ret];
            }
        }, {
            key: 'isShadow',
            value: function isShadow() {
                return !this.persisted;
            }
        }, {
            key: 'persist',
            value: function persist() {
                if (!this.persisted) {
                    var lp = this.parents[this.parents.length - 1],
                        le = this.elements[this.parents.length - 1],
                        arr;
                    lp.persist();
                    arr = lp.data[le] || (lp.data[le] = []);
                    if (arr.indexOf(this.persisted = this.data) == -1) {
                        arr.push(this.data);
                        this.listener && this.listener.notify(lp.data, le, 'a', this.data);
                    }
                }
                return this;
            }
        }, {
            key: 'append',
            value: function append(path, defaults) {
                var ret = this.shadow(path, defaults);
                ret.forEach(function (px) {
                    px.persist();
                });
                return ret;
            }
        }, {
            key: 'clone',
            value: function clone() {
                var ret = (this.parents.length && this.parents[this.parents.length - 1].append('.' + this.elements[this.elements.length - 1])[0] || new JsonProxy({})).withListener(this.listener);
                deepCopy(ret.data, this.data);
                return ret;
            }
        }, {
            key: 'set',
            value: function set(path, value) {
                if (!path) return;
                if ((typeof path === 'undefined' ? 'undefined' : _typeof(path)) == 'object') {
                    for (var i in path) {
                        this.set('.' + i, path[i]);
                    }return;
                }
                if (Array.isArray(value)) value = value[0];
                value || (value = '');
                if (typeof value == 'number') value = value.toString();
                var listener = this.listener,
                    le,
                    va,
                    maintained = true,
                    sb = 0,
                    sd;
                if (path.charAt(0) == '.') {
                    while (path.charAt(sb + 1) == '.') {
                        sb++;
                    }path = this.elements.slice(0, this.elements.length - sb).join('.') + path.substr(sb);
                    while (path.charAt(0) == '.') {
                        path = path.substr(1);
                    }
                }
                var p = path.split('.'),
                    pa = this.parents.concat(this),
                    va = [pa[0]];
                for (var i = 0; i < p.length - 1 && va.length > 0; i++) {
                    if (maintained && pa.length - sb > i + 1 && this.elements[i] == p[i]) {
                        va = [pa[i + 1]];
                    } else {
                        var nva = [],
                            e;
                        va.forEach(function (px) {
                            if ((e = px.data[p[i]]) == undefined) e = [undefined];
                            if (!Array.isArray(e)) throw 'Unable to overwrite property with subset';
                            e.forEach(function (d) {
                                nva.push(new JsonProxy(d, px.parents.concat(px), p.slice(0, i + 1), listener));
                            });
                        });
                        maintained = false;
                        va = nva;
                    }
                    value.length && va.forEach(function (px) {
                        px.persist();
                    });
                }
                le = p.pop();
                va.forEach(function (px) {
                    var v = px.data[le],
                        old = v;
                    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
                        Array.isArray(v) ? px.get('.' + le).forEach(function (px) {
                            px.set(value);
                        }) : px.append('.' + le, value);
                    } else {
                        if (v == undefined || v == []) v = '';
                        if (typeof v == 'number') v = v.toString();
                        if (v != value) {
                            if (value.length == 0) {
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
        }, {
            key: 'detach',
            value: function detach() {
                if (this.persisted && this.parents.length > 0) {
                    var p = this.parents[this.parents.length - 1],
                        e = this.elements[this.parents.length - 1];
                    var arr = p.data[e];
                    var idx = arr.indexOf(this.data);
                    if (idx != -1) {
                        arr.splice(idx, 1);
                        arr.length || delete p.data[e];
                        this.listener && this.listener.notify(p.data, e, 'd', this.data);
                    }
                    delete this.persisted; // = undefined;
                }
            }
        }, {
            key: 'withListener',
            value: function withListener(l) {
                var ret = new JsonProxy(this.data, this.parents, this.elements, l);
                ret.persisted = this.persisted;
                return ret;
            }
        }, {
            key: 'index',
            value: function index(depth) {
                depth || (depth = 1);
                return JsonProxy.indexOf(this, '........'.substr(0, depth + 1) + this.elements.slice(this.elements.length - depth, this.elements.length).join('.'));
            }
        }, {
            key: 'first',
            value: function first(path) {
                var v = this.get(path);return (Array.isArray(v) ? v[0] : v) || [];
            }
        }, {
            key: 'defaultValue',
            value: function defaultValue(path, _default) {
                var ret = this.get(path);if (ret == 0 && _default) {
                    this.set(path, _default);ret = this.get(path);
                }return ret;
            }
        }, {
            key: 'defaultSubset',
            value: function defaultSubset(path, defaults) {
                var ret = this.get(path);if (ret == 0) {
                    this.append(path, defaults);ret = this.get(path);
                }return ret;
            }
        }, {
            key: 'hasChild',
            value: function hasChild(other) {
                var _this = this;

                return this.data === other.data || other.parents.some(function (p) {
                    return p.data === _this.data;
                });
            }
        }], [{
            key: 'indexOf',
            value: function indexOf(pxA, path, value) {
                return Array.isArray(pxA) ? pxA.map(function (a) {
                    return a.get(path);
                }).indexOf(value) : pxA.get(path).map(function (a) {
                    return a.data;
                }).indexOf(pxA.data);
            }
        }]);

        return JsonProxy;
    }();

    //###############################################################################################################################

    var DfeListener = function () {
        function DfeListener(dependencyMap, node) {
            _classCallCheck(this, DfeListener);

            this.dpMap = dependencyMap || new Map();
            this.node = node;
            this.dependencies = [];
        }

        _createClass(DfeListener, [{
            key: 'undepend',
            value: function undepend() {
                var _this2 = this;

                this.dependencies.forEach(function (dep) {
                    var eleMap = _this2.dpMap.get(dep.data);
                    if (eleMap) {
                        var ctlSet = eleMap.get(dep.element);
                        if (ctlSet) {
                            ctlSet.delete(_this2.node);
                            ctlSet.size || eleMap.delete(dep.element);
                            eleMap.size || _this2.dpMap.delete(dep.data);
                        }
                    }
                });
            }
        }, {
            key: 'depend',
            value: function depend(data, element) {
                if (this.node) {
                    var e = this.dpMap.get(data);
                    e || this.dpMap.set(data, e = new Map());
                    var l = e.get(element);
                    l || e.set(element, l = new Set());
                    if (!l.has(this.node)) {
                        l.add(this.node);
                        this.dependencies.push({ data: data, element: element });
                    }
                }
            }
        }, {
            key: 'notify',
            value: function notify(data, element, action, d1) {
                var e = void 0,
                    s = void 0;
                (e = this.dpMap.get(data)) && (s = e.get(element)) && s.forEach(function (node) {
                    node.notify({ data: data, element: element, action: action, d1: d1 });
                });
                return true;
            }
        }, {
            key: 'set',
            value: function set(data, element, value, action) {
                if (data[element] != value) {
                    data[element] = value;this.notify(data, element, action, value);
                };return true;
            }
        }, {
            key: 'get',
            value: function get(data, element) {
                this.depend(data, element);return data[element];
            }
        }]);

        return DfeListener;
    }();

    //###############################################################################################################################

    var ProxyModel = function (_JsonProxy) {
        _inherits(ProxyModel, _JsonProxy);

        function ProxyModel(proxy, runtime, node) {
            _classCallCheck(this, ProxyModel);

            var _this3 = _possibleConstructorReturn(this, (ProxyModel.__proto__ || Object.getPrototypeOf(ProxyModel)).call(this, proxy.data, proxy.parents, proxy.elements, new DfeListener(runtime.listener.dpMap, node)));

            _this3.persisted = proxy.persisted;
            _this3.$runtime = runtime;
            _this3.$node = node;
            _this3.unbound = proxy;
            return _this3;
        }

        _createClass(ProxyModel, [{
            key: 'result',
            value: function result(data) {
                this.$node.acceptLogic(data, this.$node.lastError);
            }
        }, {
            key: 'error',
            value: function error(_error, data) {
                if (typeof data !== 'undefined') {
                    this.$node.lastData = data;
                }
                if (this.$node.doValidation) {
                    if (_error) {
                        this.$node.stickyError = _error;
                        this.$runtime.notifyErroring(this.$node);
                        this.$node.acceptLogic(this.$node.lastData, _error);
                    }
                }
                return _error;
            }
        }, {
            key: 'errorwatch',
            value: function errorwatch(target, reducer) {
                var _this4 = this;

                var error = '';
                if (target === 'peers') {
                    this.listener.get(this.$node.parent, 'erroringChildren').forEach(function (node) {
                        return _this4.hasChild(node.model) && (error = reducer ? reducer(error, node.lastError) : node.lastError);
                    });
                } else {
                    this.listener.get(target instanceof Node ? target : this.$node, 'erroringChildren').forEach(function (node) {
                        return error = reducer ? reducer(error, node.lastError) : node.lastError;
                    });
                }
                error && this.$node.acceptLogic(this.$node.lastData, error);
            }
        }, {
            key: 'required',
            value: function required(name, pattern, message) {
                var val = this.get(name);
                Array.isArray(val) && (val = val[0]);
                if (typeof val === 'undefined' || val.toString().replace(/ /g, '') === '') this.error(message || 'Required');else if (pattern === 'date' && !val.toString().match(arfDatePattern) || pattern && pattern !== 'date' && !val.match(pattern)) this.error(message || 'Invalid format');else return true;
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.undepend();
            }
        }]);

        return ProxyModel;
    }(JsonProxy);

    //###############################################################################################################################

    var DOMEvents = [{ name: 'onKeyDown', event: 'keydown' }, { name: 'onKeyUp', event: 'keyup' }, { name: 'onChange', event: 'change' }, { name: 'onClick', event: 'click' }, { name: 'onMouseEnter', event: 'mouseenter' }, { name: 'onMouseLeave', event: 'mouseleave' }, { name: 'onBlur', event: 'blur' }, { name: 'onFocus', event: 'focus' }];

    var DOM = function () {
        function DOM() {
            _classCallCheck(this, DOM);
        }

        _createClass(DOM, null, [{
            key: 'reconcileAttributes',
            value: function reconcileAttributes(type, domElement, newAttributes, oldAttributes) {
                if (newAttributes.class != oldAttributes.class) {
                    newAttributes.class === undefined ? domElement.removeAttribute('class') : domElement.setAttribute('class', newAttributes.class);
                }
                if (newAttributes.style != oldAttributes.style) {
                    newAttributes.style === undefined ? domElement.removeAttribute('style') : domElement.setAttribute('style', newAttributes.style);
                }
                if (newAttributes.id != oldAttributes.id) {
                    newAttributes.id === undefined ? domElement.removeAttribute('id') : domElement.setAttribute('id', newAttributes.id);
                }
                if (newAttributes.name != oldAttributes.name) {
                    newAttributes.name === undefined ? domElement.removeAttribute('name') : domElement.setAttribute('name', newAttributes.name);
                }
                DOMEvents.forEach(function (e) {
                    if (newAttributes[e.name] != oldAttributes[e.name]) {
                        typeof oldAttributes[e.name] === 'function' && domElement.removeEventListener(e.event, oldAttributes[e.name], false);
                        typeof newAttributes[e.name] === 'function' && domElement.addEventListener(e.event, newAttributes[e.name], false);
                    }
                });
                if (_typeof(newAttributes.events) === 'object' || _typeof(oldAttributes.events) === 'object') {
                    var newEvents = newAttributes.events || 0,
                        oldEvents = oldAttributes.events || 0;
                    DOMEvents.forEach(function (e) {
                        if (newEvents[e.name] != oldEvents[e.name]) {
                            typeof oldEvents[e.name] === 'function' && domElement.removeEventListener(e.event, oldEvents[e.name], false);
                            typeof newEvents[e.name] === 'function' && domElement.addEventListener(e.event, newEvents[e.name], false);
                        }
                    });
                }
                if (newAttributes.html != oldAttributes.html) {
                    if (oldAttributes.html) {
                        while (domElement.firstChild) {
                            domElement.removeChild(domElement.firstChild);
                        }
                    }
                    var html = newAttributes.html,
                        isArray = Array.isArray(html);
                    html = isArray ? html.filter(function (e) {
                        return !!e;
                    }) : html;
                    if (html && html != 0) {
                        if (isArray) {
                            html[0].nodeName ? html.forEach(function (node) {
                                return domElement.appendChild(node);
                            }) : domElement.innerHTML = html.join('');
                        } else {
                            html.nodeName ? domElement.appendChild(html) : domElement.innerHTML = html.toString();
                        }
                    }
                }
                if (newAttributes.disabled !== oldAttributes.disabled) {
                    domElement.disabled = !!newAttributes.disabled;
                }
                switch (type) {
                    case '#text':
                        newAttributes.text == oldAttributes.text || (domElement.nodeValue = newAttributes.text);
                        break;
                    case 'input':
                    case 'textarea':
                        if (newAttributes.type !== oldAttributes.type) {
                            newAttributes.type === undefined ? domElement.removeAttribute("type") : domElement.setAttribute("type", newAttributes.type);
                        }
                        if (newAttributes.type !== 'checkbox' && newAttributes.type !== 'radio') {
                            if (domElement.value != newAttributes.value) {
                                if (document.activeElement === domElement) {
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
                        break;
                    case 'label':
                        newAttributes.text == oldAttributes.text || (domElement.innerText = newAttributes.text);
                        break;
                    case 'select':
                        newAttributes.selectedIndex == domElement.selectedIndex || (domElement.selectedIndex = newAttributes.selectedIndex);
                        break;
                    case 'option':
                        newAttributes.text == oldAttributes.text || (domElement.text = newAttributes.text);
                        newAttributes.value == oldAttributes.value || (domElement.value = newAttributes.value);
                        break;
                    case 'th':
                    case 'td':
                        newAttributes.colSpan == oldAttributes.colSpan || (domElement.colSpan = newAttributes.colSpan || 1);
                        newAttributes.rowSpan == oldAttributes.rowSpan || (domElement.rowSpan = newAttributes.rowSpan || 1);
                        break;
                    case 'form':
                        if (newAttributes.action != oldAttributes.action) {
                            newAttributes.action === undefined ? domElement.removeAttribute('action') : domElement.setAttribute('action', newAttributes.action);
                        }
                        if (newAttributes.method != oldAttributes.method) {
                            newAttributes.method === undefined ? domElement.removeAttribute('method') : domElement.setAttribute('method', newAttributes.method);
                        }
                        if (newAttributes.target != oldAttributes.target) {
                            newAttributes.target === undefined ? domElement.removeAttribute('target') : domElement.setAttribute('target', newAttributes.target);
                        }
                        break;
                    case 'iframe':
                        if (newAttributes.src != oldAttributes.src) {
                            newAttributes.src === undefined ? domElement.removeAttribute('src') : domElement.setAttribute('src', newAttributes.src);
                        }
                        break;
                }
            }
        }, {
            key: 'batchRender',
            value: function batchRender(nodes) {
                nodes.forEach(function (node) {
                    return node.render(node.lastData, node.lastError, node.attributes);
                });
            }
        }, {
            key: 'nodeFromElement',
            value: function nodeFromElement(domElement) {
                function isChildOf(parentElement) {
                    if (parentElement) {
                        for (var e = domElement; e; e = e.parentElement) {
                            if (e === parentElement) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                var exploreContent = function exploreContent(content, nodes) {
                    return content.forEach(function (st) {
                        return st.childNode instanceof Node || (nodes.push(st.dom), exploreContent(st.children, nodes));
                    });
                };
                function getContentNodes(node) {
                    if (node.key === 'accountName-22') {
                        node = node;
                    }
                    var ret = [];
                    node.lastRenderStructure.filter(function (lrs) {
                        return lrs.dom;
                    }).forEach(function (st) {
                        return ret.push(st.dom), exploreContent(st.content, ret);
                    });
                    return ret;
                }
                var runtime = null,
                    prnt = domElement;
                while (!runtime && prnt) {
                    runtime = prnt._dfe_runtime;
                    prnt = prnt.parentNode;
                }
                if (runtime) {
                    var ret = null;
                    runtime.nodes.concat().reverse().filter(function (node) {
                        return node.isAttached();
                    }).forEach(function (node) {
                        return ret || getContentNodes(node).some(isChildOf) && (ret = node);
                    });
                    return ret;
                }
                return null;
            }
        }, {
            key: 'makeKeyMap',
            value: function makeKeyMap(renderStructure, lastRenderStructure) {
                if (renderStructure.length > 1 && lastRenderStructure.length > 1 && typeof lastRenderStructure[0].key !== 'undefined') {
                    var keyMap = new Map(),
                        info = void 0;
                    lastRenderStructure.forEach(function (lst) {
                        return (info = keyMap.get(lst.key)) ? info.nodes.push(lst) : keyMap.set(lst.key, { lrs: 0, nodes: [lst] });
                    });
                    return renderStructure.map(function (st) {
                        return (info = keyMap.get(st.key)) && info.nodes[info.lrs++];
                    });
                }
            }
        }]);

        return DOM;
    }();

    var Component = function () {
        function Component(node) {
            _classCallCheck(this, Component);

            this.$node = node;
        }

        _createClass(Component, [{
            key: 'destroy',
            value: function destroy() {}
        }, {
            key: 'update',
            value: function update() {
                this.$node.notify({ action: 'self' });
            }
        }, {
            key: 'doValidation',
            value: function doValidation(events, attrs) {
                return false;
            }
        }, {
            key: 'store',
            value: function store(value, method) {
                this.$node.store(value, method);
            }
        }, {
            key: 'render',
            value: function render(data, error, attributes, children) {
                var sub = [];
                children.forEach(function (map) {
                    return map.forEach(function (child) {
                        return sub.push(child);
                    });
                });
                return sub;
            }
        }, {
            key: 'onUpdate',
            value: function onUpdate(data, error, attributes) {}
        }]);

        return Component;
    }();

    var Field = function Field(clazz) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        _classCallCheck(this, Field);

        var index = 1,
            parameters = {},
            children = [],
            name = void 0;
        if (!(clazz.prototype instanceof Component)) {
            throw 'Must specify Component class';
        }
        if (typeof arguments[1] === 'string') {
            name = arguments[1];
            index++;
        }
        var next = arguments[index];
        if ((typeof next === 'undefined' ? 'undefined' : _typeof(next)) === 'object' && !Array.isArray(next) && !(next instanceof Field)) {
            parameters = next;
            index++;
        }
        for (var i = index; i < arguments.length; i++) {
            next = arguments[i];
            (Array.isArray(next) ? next : [next]).forEach(function (arg) {
                return arg instanceof Field && children.push(arg);
            });
        }
        var staticTest = function staticTest(field) {
            return field.class && typeof field.class === 'string';
        };
        _extends(this, parameters, { component: clazz, name: name, children: children });
    };

    var Form = function (_Component) {
        _inherits(Form, _Component);

        function Form() {
            _classCallCheck(this, Form);

            return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, null, [{
            key: 'field',
            value: function field(clazz) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                var field = new (Function.prototype.bind.apply(Field, [null].concat([clazz], args)))();
                if (clazz.prototype instanceof Form) {
                    field.children = clazz.fields(field.children, field.config || {}) || [];
                    Array.isArray(field.children) || (field.children = [field.children]);
                    // Not quite sure about this.
                    if (field.layout) {
                        field.layout.forEach(function (layout, i) {
                            return field.children[i] && (field.children[i].layout = Array.isArray(layout) ? layout : [layout]);
                        });
                    }
                }
                return field;
            }
        }, {
            key: 'fields',
            value: function fields(children, field) {
                return children || [];
            }
        }]);

        return Form;
    }(Component);

    function completeNames(fields) {
        var fieldIndex = 0;
        (Array.isArray(fields) ? fields : [fields]).forEach(function (field) {
            return field.name || (field.name = field.component.name + '#' + ++fieldIndex);
        });
        return fields;
    }

    function createElement(type, attributes, children) {
        if ((typeof attributes === 'undefined' ? 'undefined' : _typeof(attributes)) !== 'object') {
            return { type: type, key: type, attributes: {}, children: [] };
        }
        if (attributes instanceof Node) {
            return { type: type, key: attributes.key, childNode: attributes, attributeMapper: children };
        } else {
            // attributes may have get, set, val, ref and key ... and bunch of stuff meant to put in dom
            return { type: type, ref: attributes.ref, key: attributes.key || type, attributes: attributes || {}, children: children || [] };
        }
    }

    var Node = function () {
        function Node(parent, field, unboundModel, runtime) {
            _classCallCheck(this, Node);

            _extends(this, {
                parent: parent,
                runtime: runtime,
                form: null,
                field: field,
                control: null,
                notifications: [],
                children: new Map(),
                erroringChildren: new Set(),
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
            });
            var control = new field.component(this);
            this.key = field.name + '-' + unboundModel.data.key;
            this.form = control instanceof Form ? control : parent.form;
            this.control = control;
            this.model = new ProxyModel(unboundModel, runtime, this);
        }

        _createClass(Node, [{
            key: 'render',
            value: function render(lastData, lastError, lastAttributes) {
                var _this6 = this;

                if (this.shouldRender && this.isAttached()) {
                    this.shouldRender = false;

                    var mapper = lastAttributes.attributeMapper,
                        rest = _objectWithoutProperties(lastAttributes, ['attributeMapper']);

                    var renderStructure = this.control.render(lastData, lastError, rest, this.children);
                    var attributes = this.field.layout || [],
                        layoutIndex = 0;
                    if (this.elementInfo.attributeMapper) {
                        var f = mapper;
                        mapper = function mapper(a) {
                            return _this6.elementInfo.attributeMapper(f ? f(a) : a);
                        };
                    }
                    // The problem here is we have layout attributes of container, but we can't pass its portion to children because there s no telling what s their size. 
                    // if we were to calculate current size, every time child moves or its dimensions change it would need to notify all siblings to update their parent node attributes
                    renderStructure = (Array.isArray(renderStructure) ? renderStructure : [renderStructure]).map(function (st) {
                        return st instanceof Node ? st : {
                            key: st && st.type || '0',
                            attributes: (mapper ? mapper(attributes[layoutIndex++] || {}) : attributes[layoutIndex++]) || {},
                            dom: null,
                            content: st
                        };
                    });
                    var lrs = 0,
                        tail = this.$prevDom,
                        prevNode = null,
                        followingChildNode = null,
                        keyMap = DOM.makeKeyMap(renderStructure, this.lastRenderStructure);
                    var attachedChildren = new Set();
                    this.lastRenderStructure.forEach(function (lst) {
                        return lst.used = false;
                    });
                    for (var rs = 0; rs < renderStructure.length; rs++) {
                        var st = renderStructure[rs];
                        var lst = keyMap ? keyMap[rs] : this.lastRenderStructure[lrs];
                        var use = st === lst || lst && !(st instanceof Node || lst instanceof Node);
                        if (use) {
                            lst.used = true;
                            lrs++;
                        }
                        if (st instanceof Node) {
                            followingChildNode || (followingChildNode = st);
                            tail = st.setDom(this.elementInfo, this.$parentDom, tail);
                            attachedChildren.add(st);
                            prevNode && (prevNode.$nextNode = st), st.$prevNode = prevNode, prevNode = st;
                        } else {
                            st.dom = tail = use ? lst.dom : this.$parentDom.insertBefore(document.createElement(this.elementInfo.type), tail ? tail.nextSibling : this.$parentDom.firstChild);
                            DOM.reconcileAttributes(this.elementInfo.type, st.dom, st.attributes, use ? lst.attributes : {});
                            st.content = this.applyInPlace(st.dom, st.content, use ? lst.content : [], attachedChildren);
                            use || st.attributes.ref && st.attributes.ref(st.dom);
                        }
                    }
                    prevNode && (prevNode.$nextNode = null);
                    tail === this.$lastDom || this.adjustLastDom(tail);
                    this.lastRenderStructure.forEach(function (lst) {
                        return lst.used || lst instanceof Node || _this6.$parentDom.removeChild(lst.dom);
                    });
                    this.lastAttachedChildren.forEach(function (child) {
                        return attachedChildren.has(child) || child.setDom(null, null, null);
                    });
                    this.lastAttachedChildren = attachedChildren;
                    this.$followingChildNode = followingChildNode;
                    this.lastRenderStructure = renderStructure;
                }
            }
        }, {
            key: 'adjustLastDom',
            value: function adjustLastDom(tail) {
                if (tail !== this.$lastDom) {
                    if (this.parent && this.parent.$lastDom === this.$lastDom) {
                        this.parent.adjustLastDom(tail);
                    }
                    if (this.$nextNode && this.$nextNode.$prevDom === this.$lastDom) {
                        this.$nextNode.adjustPrevDom(tail);
                    }
                    this.$lastDom = tail;
                }
            }
        }, {
            key: 'adjustPrevDom',
            value: function adjustPrevDom(head) {
                if (head !== this.$prevDom) {
                    if (this.$followingChildNode && this.$followingChildNode.$prevDom === this.$prevDom) {
                        this.$followingChildNode.adjustPrevDom(head);
                    }
                    if (this.$lastDom === this.$prevDom) {
                        this.adjustLastDom(head);
                    }
                    this.$prevDom = head;
                }
            }
        }, {
            key: 'applyInPlace',
            value: function applyInPlace(domElement, renderStructure, lastRenderStructure, attachedChildren) {
                renderStructure = (Array.isArray(renderStructure) ? renderStructure : [renderStructure]).map(function (st) {
                    return typeof st === 'string' ? { type: '#text', attributes: { text: st }, children: [] } : st;
                }).filter(function (st) {
                    return st && st.type;
                });

                var prev = null,
                    prevNode = null,
                    keyMap = DOM.makeKeyMap(renderStructure, lastRenderStructure);
                lastRenderStructure.forEach(function (lst) {
                    return lst.used = false;
                });
                for (var lrs = 0, rs = 0; rs < renderStructure.length; rs++) {
                    var st = renderStructure[rs];
                    if (st instanceof Node) {
                        throw "Component can't be mounted in a fixed-width node";
                    }
                    if (typeof st === 'string') {
                        renderStructure[rs] = st = { type: '#text', attributes: { text: st.toString() }, children: [] };
                    }

                    var lst = keyMap ? keyMap[rs] : lastRenderStructure[lrs],
                        child = st.childNode;
                    var use = lst && !lst.used && st.type === lst.type && child === lst.childNode; // this should never happen && !attachedChildren.has(child);
                    if (use) {
                        lst.used = true;
                        lrs++;
                    }
                    if (child !== undefined) {
                        prev = child.setDom(st, domElement, prev);
                        attachedChildren.add(child);
                        prevNode && (prevNode.$nextNode = child), child.$prevNode = prevNode, prevNode = child;
                    } else {
                        st.dom = use ? lst.dom : st.type === '#text' ? document.createTextNode('') : document.createElement(st.type);
                        prev = prev ? prev.nextSibling : domElement.firstChild;
                        if (prev !== st.dom) {
                            prev = domElement.insertBefore(st.dom, prev);
                        }
                        st.children = this.applyInPlace(st.dom, st.children, use ? lst.children : [], attachedChildren);
                        DOM.reconcileAttributes(st.type, st.dom, st.attributes, use ? lst.attributes : {});
                        use || st.attributes.ref && st.attributes.ref(st.dom);
                    }
                }
                prevNode && (prevNode.$nextNode = null);
                lastRenderStructure.forEach(function (lst) {
                    return lst.used || lst.childNode || lst.dom.parentElement.removeChild(lst.dom);
                });
                return renderStructure;
            }
        }, {
            key: 'setDom',
            value: function setDom(elementInfo, parentDom, prevDom) {
                var _this7 = this;

                var updateAttributes = false,
                    prev = prevDom,
                    layoutIndex = 0,
                    attributeMapper = void 0;
                if (parentDom) {
                    if (updateAttributes = !this.shouldRender) {
                        var m1 = this.attributes.attributeMapper,
                            m2 = elementInfo.attributeMapper;
                        attributeMapper = m1 && m2 ? function (a) {
                            return m2(m1(a));
                        } : m1 ? m1 : m2;
                    }
                    if (this.elementInfo && elementInfo.type !== this.elementInfo.type) {
                        throw 'Unsupported';
                    }
                } else {
                    this.$nextNode = this.$prevNode = null;
                }
                this.lastRenderStructure.forEach(function (lst) {
                    if (lst instanceof Node) {
                        prev = lst.setDom(elementInfo, parentDom, prev);
                    } else {
                        if (parentDom) {
                            prev = prev ? prev.nextSibling : _this7.$parentDom === parentDom ? lst.dom : null;
                            if (lst.dom !== prev) {
                                prev = parentDom.insertBefore(lst.dom, prev);
                            }
                            if (updateAttributes) {
                                var attributes = _this7.field.layout && _this7.field.layout[layoutIndex++] || {};
                                attributeMapper && (attributes = attributeMapper(attributes));
                                DOM.reconcileAttributes(elementInfo.type, lst.dom, attributes, lst.attributes);
                                lst.attributes = attributes;
                            }
                        } else {
                            _this7.$parentDom && _this7.$parentDom.removeChild(lst.dom);
                        }
                    }
                });
                this.elementInfo = elementInfo;
                this.$prevDom = prevDom;
                this.$lastDom = prev;
                this.$parentDom = parentDom;
                return prev;
            }
        }, {
            key: 'isAttached',
            value: function isAttached() {
                var node = this;
                for (; node && node.$parentDom; node = node.parent) {}
                return !node;
            }
        }, {
            key: 'notify',
            value: function notify(action) {
                this.notifications.push(action);
                this.runtime.shouldAnythingRender = true;
            }
        }, {
            key: 'store',
            value: function store(value, method) {
                var setter = this.field.set || this.attributes.set;
                typeof setter === 'function' && setter.call(this.form, this.unboundModel, value, method);
            }
        }, {
            key: 'acceptLogic',
            value: function acceptLogic(data, error) {
                var childrenFields = this.field.children;
                if (typeof data !== 'undefined' && !this.evicted) {
                    if (childrenFields.length) {
                        data = (Array.isArray(data) ? data : (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' ? [data] : []).map(function (d) {
                            return d instanceof JsonProxy ? d : new JsonProxy(d);
                        });
                        this.runtime.reconcileChildren(this, data);
                    }
                    this.lastData = data;
                    this.lastError = error;
                    this.shouldRender = true;
                    this.runtime.shouldAnythingRender = true;
                    this.control.onUpdate(data, error, this.attributes);
                }
            }
        }]);

        return Node;
    }();

    var Runtime = function () {
        function Runtime(config, listener) {
            _classCallCheck(this, Runtime);

            this.config = config || {};
            this.schedule = [];
            this.listener = new DfeListener(listener instanceof DfeListener && listener.dpMap);
            this.nodes = [];
            this.shouldAnythingRender = false;
            this.pendingLogic = new Set();
        }

        _createClass(Runtime, [{
            key: 'setDfeForm',
            value: function setDfeForm(formClass) {
                this.formClass = formClass;
                return this;
            }
        }, {
            key: 'setModel',
            value: function setModel(model) {
                this.rootProxy = (model instanceof JsonProxy ? model : new JsonProxy(model)).withListener(this.listener);
                return this;
            }
        }, {
            key: 'stop',
            value: function stop() {
                this.processor && clearInterval(this.processor);
            }
        }, {
            key: 'shutdown',
            value: function shutdown() {
                this.processor && clearInterval(this.processor);
                if (this.nodes.length) {
                    var root = this.nodes[0];
                    root.isAttached() && root.setDom(null, null, null);
                    this.evict(root);
                    this.removeEvicted();
                }
                this.processor = null;
            }
        }, {
            key: 'restart',
            value: function restart(parentElement, initAction, interval) {
                var _this8 = this;

                parentElement || this.nodes.length && (parentElement = this.nodes[0].$parentDom);
                this.shutdown();
                this.initAction = { action: initAction || 'init' };
                if (this.rootProxy && this.formClass) {
                    parentElement && (parentElement._dfe_runtime = this);
                    var node = this.addNode(null, this.rootProxy, new Field(this.formClass, completeNames(this.formClass.fields([], this.config))));
                    node.setDom({ type: 'div' }, parentElement, null);
                    this.processor = setInterval(function () {
                        return _this8.processInterceptors();
                    }, interval||50);
                    this.processInterceptors();
                }
                return this;
            }
        }, {
            key: 'enforceValidation',
            value: function enforceValidation() {
                this.nodes.forEach(function (node) {
                    return node.notifications.push({ action: 'validate' });
                });
                this.shouldAnythingRender = true;
            }
        }, {
            key: 'setRoot',
            value: function setRoot(parentElement, afterNode) {
                var node = this.nodes[0];
                node && node.setDom(node.elementInfo, parentElement, afterNode || null);
            }
        }, {
            key: 'processInterceptors',
            value: function processInterceptors() {
                if (this.shouldAnythingRender) {
                    this.shouldAnythingRender = false;
                    for (var i = 0; i < this.nodes.length; i++) {
                        this.logic(this.nodes[i]);
                    }
                    this.removeEvicted();
                    DOM.batchRender(this.nodes);
                }
                while (this.schedule.length) {
                    this.schedule.shift()(this);
                }
            }
        }, {
            key: 'addNode',
            value: function addNode(parent, modelProxy, field) {
                var unbound = modelProxy.withListener(this.listener); //Object.assign(path => unbound.get(path), JsonProxy.prototype, modelProxy, {listener: this.listener});
                var node = new Node(parent, field, unbound, this);
                node.notify(this.initAction);
                this.nodes.push(node);
                return node;
            }
        }, {
            key: 'removeErroring',
            value: function removeErroring(node) {
                if (node.lastError) {
                    delete node.lastError;
                    for (var cur = node.parent; cur && cur.erroringChildren.delete(node); cur = cur.parent) {
                        this.listener.notify(cur, 'erroringChildren');
                    }
                }
            }
        }, {
            key: 'notifyErroring',
            value: function notifyErroring(node) {
                for (var cur = node.parent; cur && !cur.erroringChildren.has(node); cur = cur.parent) {
                    cur.erroringChildren.add(node), this.listener.notify(cur, 'erroringChildren', 'validate');
                }
            }
        }, {
            key: 'evict',
            value: function evict(node) {
                var _this9 = this;

                node.evicted = true;
                node.notifications = [];
                node.children.forEach(function (fieldMap) {
                    return fieldMap.forEach(function (node) {
                        return _this9.evict(node);
                    });
                });
            }
        }, {
            key: 'removeEvicted',
            value: function removeEvicted() {
                var _this10 = this;

                var cur = 0;
                this.nodes.forEach(function (node, index) {
                    if (node.evicted) {
                        _this10.removeErroring(node);
                        node.model.destroy();
                        node.control.destroy();
                    } else {
                        _this10.nodes[cur++] = _this10.nodes[index];
                    }
                });
                this.nodes.splice(cur);
            }
        }, {
            key: 'reconcileChildren',
            value: function reconcileChildren(parent, rowProxies) {
                var _this11 = this;

                // TODO... 
                var childFields = parent.field.children;
                var ownModel = parent.model.unbound;
                var lastChildren = parent.children;
                if (lastChildren.size || childFields.length) {
                    var rows = new Map(),
                        rkeys = new Set(),
                        fkeys = new Set(),
                        skeys = new Set(),
                        i = 0,
                        m,
                        present,
                        a,
                        f,
                        n,
                        c,
                        d;
                    lastChildren.forEach(function (v, k) {
                        return k ? (rkeys.add(k), i++ || v.forEach(function (_, f) {
                            return fkeys.add(f);
                        })) : v.forEach(function (_, f) {
                            return skeys.add(f);
                        });
                    });
                    (childFields || []).forEach(function (d) {
                        (typeof d['class'] == 'string' && d['class'] != '' ? skeys : fkeys).add(d);
                    });
                    (rowProxies || []).forEach(function (r) {
                        rows.set(r.data, r);rkeys.add(r.data);
                    });
                    rkeys.forEach(function (r) {
                        (m = lastChildren.get(r)) || lastChildren.set(r, m = new Map());
                        present = rows.get(r);
                        fkeys.forEach(function (k) {
                            c = m.get(k);
                            present ? c || m.set(k, this.addNode(parent, present, k)) : c && (this.evict(c), m['delete'](k));
                        }, _this11);
                        m.size || lastChildren['delete'](r);
                    });
                    m = lastChildren.get(null) || new Map();
                    skeys.forEach(function (k) {
                        c = m.get(k);
                        c || m.set(k, _this11.addNode(parent, ownModel, k));
                    });
                    m.size ? lastChildren.set(null, m) : lastChildren['delete'](null);
                }
            }
        }, {
            key: 'logic',
            value: function logic(node) {
                if (node.notifications.length && !node.evicted) {
                    var events = node.notifications;
                    node.notifications = [];
                    try {
                        var m = node.model,
                            d = node.field,
                            v,
                            fg,
                            fv;
                        //m.events = events;
                        var attrs = node.attributes = typeof d.atr === 'function' && d.atr.call(node.form, m) || {};
                        node.doValidation = !!(attrs.errorwatch || node.control.doValidation(events, attrs));
                        this.removeErroring(node);
                        typeof (v = typeof (fg = d.get || attrs.get) != 'function' ? [m] : fg.call(node.form, m, events)) == 'undefined' || m.result(v);
                        if (attrs.errorwatch) {
                            var _attrs$errorwatch = attrs.errorwatch,
                                _target = _attrs$errorwatch.target,
                                reducer = _attrs$errorwatch.accept;

                            m.errorwatch(_target, reducer);
                        } else {
                            node.doValidation && typeof (fv = d.val || attrs.val) == 'function' && fv.call(node.form, m, events);
                        }
                    } catch (e) {
                        node.doValidation = 1;try {
                            node.model.error(e.message);
                        } catch (e) {}console.error(node.field + '\n' + e.message + '\n' + e.stack);
                    }
                }
            }
        }, {
            key: 'findChildren',
            value: function findChildren(nodes, deep, includeSelf, field, model) {
                var ret = [];
                function traverse(control) {
                    control.children.forEach(function (map) {
                        return map.forEach(function (node) {
                            (!field || node.field.name === field) && (!model || node.model.data === model.data) && ret.push(node);
                            deep === false || traverse(node);
                        });
                    });
                }
                (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (node) {
                    includeSelf && (!field || node.field.name === field) && (!model || node.model.data === model.data) && ret.push(node);
                    traverse(node);
                });
                return ret;
            }
        }, {
            key: 'findNodes',
            value: function findNodes(fields, modelProxy) {
                return this.nodes.filter(function (node) {
                    return array.indexOf(node.field.name) !== -1 && (!modelProxy || node.model.data == modelProxy.data);
                });
            }
        }], [{
            key: 'startRuntime',
            value: function startRuntime(args) {
                var model = args.model,
                    form = args.form,
                    node = args.node,
                    listener = args.listener,
                    config = args.config,
                    initAction = args.initAction,
                    ready = args.ready;

                var runtime = new Runtime(config, model instanceof JsonProxy && model.listener);
                typeof ready === 'function' && runtime.schedule.push(ready.bind(null, runtime, args));
                runtime.setModel(model).setDfeForm(form).restart(node, initAction);
                return runtime;
            }
        }]);

        return Runtime;
    }();

    return {
        JsonProxy: JsonProxy,
        Form: Form,
        Runtime: Runtime,
        startRuntime: Runtime.startRuntime,
        createElement: createElement,
        nodeFromElement: DOM.nodeFromElement,
        createNode: function createNode() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return new (Function.prototype.bind.apply(Node, [null].concat(args)))();
        },
        reconcileDOMAttributes: DOM.reconcileAttributes,
        Component: Component
    };
});

define('core-validation-component', ['dfe-core'], function (Core) {
    return function (_Core$Component) {
        _inherits(CoreValidationComponent, _Core$Component);

        function CoreValidationComponent() {
            _classCallCheck(this, CoreValidationComponent);

            return _possibleConstructorReturn(this, (CoreValidationComponent.__proto__ || Object.getPrototypeOf(CoreValidationComponent)).apply(this, arguments));
        }

        _createClass(CoreValidationComponent, [{
            key: 'doValidation',
            value: function doValidation(events, attrs) {
                var vs = (attrs.vstrategy || '').split(' ');
                delete attrs.vstrategy;
                if (vs.indexOf('none') != -1 || vs.indexOf('disabled') == -1 && (attrs.disabled || attrs.hidden)) {
                    return false;
                }
                if (this.$node.lastError) {
                    return true;
                }
                if (vs.indexOf('always') != -1 || vs.indexOf('followup') != -1 && this.$node.stickyError) {
                    return true;
                }
                if (vs.indexOf('notified') != -1 && events[0].action != 'init') {
                    return true;
                }
                return events.some(function (e) {
                    return 'validate' === e.action;
                });
            }
        }]);

        return CoreValidationComponent;
    }(Core.Component);
});