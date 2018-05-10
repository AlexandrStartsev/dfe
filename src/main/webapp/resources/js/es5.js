'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

define('dfe-core', function () {
    var arfDatePattern = /^(18|19|20)((\\d\\d(((0[1-9]|1[012])(0[1-9]|1[0-9]|2[0-8]))|((0[13578]|1[02])(29|30|31))|((0[4,6,9]|11)(29|30))))|(([02468][048]|[13579][26])0229))$/;
    //deep
    function deepCopy(to, from) {
        Object.getOwnPropertyNames(from).forEach(function (key) {
            var v = from[key];
            to[key] = (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' ? deepCopy(Array.isArray(v) ? [] : {}, v) : v;
        });
        return to;
    }

    var nextKey = 0;

    //###############################################################################################################################
    function JsonProxy(data, parents, elements, listener) {
        this.parents = parents || [];
        this.elements = elements || [];
        this.data = data || {};
        this.persisted = data;
        this.data.key || (this.data.key = ++nextKey);
        this.listener = listener;
        if (this.parents.length != this.elements.length) throw 'Oops';
    }

    JsonProxy.prototype.toString = function () {
        return 'JsonProxy{' + this.elements.join('.') + '}';
    };

    /* Queries model from value(s) or subset(s) 
     * @param {String} path full-path string i.e. 'policy.class.code' or relative path like '.code', '..class.code' etc
     * @returns {String|JsonProxy|Array}
     */
    JsonProxy.prototype.get = function (path) {
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
    };

    JsonProxy.prototype.shadow = function (path, defaults) {
        if (path.length == 0) return [];
        if (path.charAt(0) == '.') path = this.elements.join('.') + path;
        var p = path.split('.'),
            me = this,
            pa = this.parents.concat(this),
            ret;
        for (var i = 0; i < p.length; i++) {
            if (!(pa.length > i + 1 && this.elements[i] == p[i])) {
                pa = pa.slice(0, i + 1);
                for (var j = i + 1; j <= p.length; j++) {
                    pa = pa.concat(new JsonProxy(undefined, pa, p.slice(0, j), this.listener));
                }ret = pa.pop();
                break;
            }
        }deepCopy((ret = ret || new JsonProxy(undefined, this.parents, p, this.listener)).data, defaults);
        return [ret];
    };

    JsonProxy.prototype.isShadow = function () {
        return !this.persisted;
    };

    JsonProxy.prototype.persist = function () {
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
    };

    JsonProxy.prototype.append = function (path, defaults) {
        var ret = this.shadow(path, defaults);
        ret.forEach(function (px) {
            px.persist();
        });
        return ret;
    };

    JsonProxy.prototype.clone = function () {
        var ret = (this.parents.length && this.parents[this.parents.length - 1].append('.' + this.elements[this.elements.length - 1])[0] || new JsonProxy({})).withListener(this.listener);
        deepCopy(ret.data, this.data);
        return ret;
    };

    JsonProxy.prototype.set = function (path, value) {
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
    };

    JsonProxy.prototype.detach = function () {
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
    };

    JsonProxy.prototype.withListener = function (l) {
        var ret = new JsonProxy(this.data, this.parents, this.elements, l);
        ret.persisted = this.persisted;
        return ret;
    };

    //####################################SUPPORTING FUNCTIONS#######################################################################

    JsonProxy.indexOf = function (pxA, path, value) {
        return Array.isArray(pxA) ? pxA.map(function (a) {
            return a.get(path);
        }).indexOf(value) : pxA.get(path).map(function (a) {
            return a.data;
        }).indexOf(pxA.data);
    };

    JsonProxy.prototype.index = function (depth) {
        depth || (depth = 1);
        return JsonProxy.indexOf(this, '........'.substr(0, depth + 1) + this.elements.slice(this.elements.length - depth, this.elements.length).join('.'));
    };

    /* returns first instance of subset or first item. 
     * @param {String} path full-path string i.e. 'policy.class' or relative path like '.class'
     * @returns {String|JsonProxy} 
     */
    JsonProxy.prototype.first = function (path) {
        var v = this.get(path);return (Array.isArray(v) ? v[0] : v) || [];
    };

    /* retrieves existing value from model, if field doesn't exist, default value is assigned to field in model and returned. 
     * @param {String} path full-path string i.e. 'policy.class' or relative path like '.class'
     * @param {String} _default default value
     * @returns {String|Array}
     */
    JsonProxy.prototype.defaultValue = function (path, _default) {
        var ret = this.get(path);if (ret == 0 && _default) {
            this.set(path, _default);ret = this.get(path);
        }return ret;
    };

    /* similar to JsonProxy::defaultValue, but for subsets. If subset doesn't exist, instance will be added to a model and returned
     * @param {String} path full-path string i.e. 'policy.class.code' or relative path like '.code', '..class.code' etc
     * @param {Object} defaults - pre-populated fields only when appended
     * @returns {Array} array of JsonProxy objects (with a length of at least 1)
     */
    JsonProxy.prototype.defaultSubset = function (path, defaults) {
        var ret = this.get(path);if (ret == 0) {
            this.append(path, defaults);ret = this.get(path);
        }return ret;
    };

    /*
     * @param {Object|JsonProxy} to - object to merge into current object. notifications will dispatched, dependencies on "to" object fields will not be made
     */
    JsonProxy.prototype.mergeShallow = function (to) {
        if (to && typeof to.withListener == 'function') to = to.persisted;
        if (to == this.persisted) return;
        if ((typeof to === 'undefined' ? 'undefined' : _typeof(to)) != 'object') this.detach();else {
            this.persist();
            var k,
                l = this.listener,
                dest = this.data;
            for (var k in dest) {
                to[k] == dest[k] || (l.notify(dest, k, 'm'), dest[k] = to[k]);
            }
        }
    };
    //###############################################################################################################################
    function DfeListener(dependencyMap, control) {
        this.dpMap = dependencyMap || new Map();
        this.control = control;
    }

    DfeListener.prototype.depend = function (data, element) {
        if (this.control) {
            var e = this.dpMap.get(data);
            e || this.dpMap.set(data, e = new Map());
            var l = e.get(element);
            l || e.set(element, l = new Set());
            if (!l.has(this.control)) {
                l.add(this.control);
                this.control.dependencies.push({ data: data, element: element });
            }
        }
    };

    DfeListener.prototype.For = function (control) {
        return new DfeListener(this.dpMap, control);
    };

    DfeListener.prototype.notify = function (data, element, action, d1) {
        var e, s;
        (e = this.dpMap.get(data)) && (s = e.get(element)) && s.forEach(function (cc) {
            cc.notifications.push({ data: data, element: element, action: action, d1: d1 });
        });
        return true;
    };

    DfeListener.prototype.set = function (data, element, value, action) {
        if (data[element] != value) {
            data[element] = value;this.notify(data, element, action, value);
        };return true;
    };
    DfeListener.prototype.get = function (data, element) {
        this.depend(data, element);return data[element];
    };

    var wrapProxy = function () {
        var keys = [];
        for (var key in new JsonProxy()) {
            key === 'listener' || keys.push(key);
        }
        return function (proxy, target, listener) {
            for (var i = keys.length - 1; i >= 0; i--) {
                target[keys[i]] = proxy[keys[i]];
            }target.listener = listener;
            return target;
        };
    }();

    //###############################################################################################################################

    function createElement(type, attributes, children) {
        if ((typeof attributes === 'undefined' ? 'undefined' : _typeof(attributes)) !== 'object') {
            return { type: type, key: type, attributes: [{}], children: [] };
        }
        if (attributes instanceof Node) {
            var info = attributes.immediateNodeInfo;
            return { type: type, key: attributes.field.name, attributes: typeof children === 'function' ? info.map(children) : info, childNode: attributes, children: [] };
        } else {
            return { type: type, ref: attributes.ref, key: attributes.key || type, attributes: [attributes], children: children || [] };
        }
    }

    var DOMEvents = [{ name: 'onKeyDown', event: 'keydown' }, { name: 'onKeyUp', event: 'keyup' }, { name: 'onChange', event: 'change' }, { name: 'onClick', event: 'click' }, { name: 'onMouseEnter', event: 'mouseenter' }, { name: 'onMouseLeave', event: 'mouseleave' }, { name: 'onBlur', event: 'blur' }];

    var DOM = function () {
        function DOM() {
            _classCallCheck(this, DOM);
        }

        _createClass(DOM, null, [{
            key: 'calcImmediateNodeInfo',
            value: function calcImmediateNodeInfo(renderStructure, fpos) {
                var fi = 0;
                return renderStructure.reduce(function (pos, st) {
                    return pos.concat(st instanceof Node ? st.immediateNodeInfo : fpos[fi++] || {});
                }, []);
            }
        }, {
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
                if (!!newAttributes.disabled != domElement.disabled) {
                    domElement.disabled = !!newAttributes.disabled;
                }
                switch (type) {
                    case 'label':
                        newAttributes.text == oldAttributes.text || (domElement.innerText = newAttributes.text);
                        break;
                    case '#text':
                        newAttributes.text == oldAttributes.text || (domElement.nodeValue = newAttributes.text);
                        break;
                    case 'input':
                        newAttributes.type == oldAttributes.type || (domElement.type = newAttributes.type);
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
                    case 'select':
                        newAttributes.selectedIndex == domElement.selectedIndex || (domElement.selectedIndex = newAttributes.selectedIndex);
                        break;
                    case 'option':
                        newAttributes.text == oldAttributes.text || (domElement.text = newAttributes.text);
                        newAttributes.value == oldAttributes.value || (domElement.value = newAttributes.value);
                        break;
                    case 'td':
                        (newAttributes.colSpan || 1) == domElement.colSpan || (domElement.colSpan = newAttributes.colSpan || 1);
                        (newAttributes.rowSpan || 1) == domElement.rowSpan || (domElement.rowSpan = newAttributes.rowSpan || 1);
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
                }
            }
        }, {
            key: 'applyInSingleNode',
            value: function applyInSingleNode(node, parentDOMElement, renderStructure, lastRenderStructure) {
                if (renderStructure === lastRenderStructure) {
                    var tail = parentDOMElement.firstChild;
                    lastRenderStructure.forEach(function (lst) {
                        return lst.dom.forEach(function (e) {
                            return tail = tail === e ? tail.nextSibling : (parentDOMElement.insertBefore(e, tail), tail);
                        });
                    });
                    return;
                }
                if (parentDOMElement) {
                    (function () {
                        var tail = parentDOMElement.firstChild,
                            info = void 0,
                            keyMap = void 0;
                        if (renderStructure.length > 1 && lastRenderStructure.length > 1 && typeof lastRenderStructure[0].key !== 'undefined') {
                            keyMap = new Map();
                            lastRenderStructure.forEach(function (lst) {
                                lst.used = false;
                                if (info = keyMap.get(lst.key)) {
                                    info.nodes.push(lst);
                                } else {
                                    keyMap.set(lst.key, { lrs: 0, nodes: [lst] });
                                }
                            });
                            keyMap = renderStructure.map(function (st) {
                                return (info = keyMap.get(st.key)) && info.nodes[info.lrs++];
                            });
                        }

                        var _loop = function _loop(_lrs, rs) {
                            var st = renderStructure[rs];
                            if (typeof st === 'string') {
                                renderStructure[rs] = st = { type: '#text', attributes: [{ text: st.toString() }], children: [] };
                            }

                            var lst = keyMap ? keyMap[rs] : lastRenderStructure[_lrs];
                            var use = lst && !lst.used && st.type === lst.type && st.childNode === lst.childNode; // && lst.dom ?
                            if (use) {
                                lst.used = use = !st.childNode || st.childNode.immediateNodeInfo.length === lst.dom.length;
                                _lrs++;
                            }

                            if (st.childNode !== undefined) {
                                st.dom = use ? lst.dom : Array.apply(null, { length: st.childNode.immediateNodeInfo.length }).map(function () {
                                    return document.createElement(st.type);
                                });
                                DOM.applyDOMChanges(node, st.dom, [st.childNode], use ? [lst.childNode] : []);
                            } else {
                                st.dom = use ? lst.dom : [st.type === '#text' ? document.createTextNode('') : document.createElement(st.type)];
                                if (st.children.length !== 0 || use && lst.children.length !== 0) {
                                    st.children = DOM.applyDOMChanges(node, st.dom, [st.children], use ? [lst.children] : [])[0];
                                }
                                use || st.ref && st.ref(st.dom[0]);
                            }
                            if (st.dom.length) {
                                st.dom.forEach(function (e, i) {
                                    return DOM.reconcileAttributes(st.type, e, st.attributes[i] || {}, use && lst.attributes[i] || {});
                                });
                                if (!use || lst.parentNode !== parentDOMElement || tail && tail !== st.dom[0]) {
                                    st.dom.forEach(function (e) {
                                        return parentDOMElement.insertBefore(e, tail);
                                    });
                                }
                                tail = st.dom[st.dom.length - 1].nextSibling;
                            }
                            st.parentNode = parentDOMElement;
                            lrs = _lrs;
                        };

                        for (var lrs = 0, rs = 0; rs < renderStructure.length; rs++) {
                            _loop(lrs, rs);
                        }
                    })();
                }
                lastRenderStructure.forEach(function (lst) {
                    if (!lst.used && lst.parentNode) {
                        lst.dom.forEach(function (e) {
                            return lst.parentNode.removeChild(e);
                        });
                        delete lst.parentNode;
                    }
                });
            }
        }, {
            key: 'applyDOMChanges',
            value: function applyDOMChanges(node, parentDOMElements, renderStructure, lastRenderStructure) {
                var lrs = 0;
                if (parentDOMElements != 0) {
                    for (var rs = 0, ps = 0; rs < renderStructure.length; rs++) {
                        var _st = renderStructure[rs];
                        var _lst = lastRenderStructure[lrs];
                        var _use = _st === _lst || _lst !== undefined && _st !== undefined && !(_st instanceof Node || _lst instanceof Node);
                        if (_st !== undefined) {
                            if (_st instanceof Node) {
                                node.attachedChildNodes.add(_st);
                                _st.parentDOMElements = parentDOMElements.slice(ps, ps += _st.immediateNodeInfo.length);
                            } else {
                                if (_st !== _lst) {
                                    _st = (_st.forEach ? _st : [_st]).filter(function (e) {
                                        return (typeof e === 'undefined' ? 'undefined' : _typeof(e)) === 'object' || typeof e === 'string';
                                    });
                                    renderStructure[rs] = _st;
                                }
                                DOM.applyInSingleNode(node, parentDOMElements[ps++], _st, _use ? _lst : []);
                            }
                        } else {
                            ps++;
                        }
                        _use && lrs++;
                    }
                }
                while (lrs < lastRenderStructure.length) {
                    var _lst2 = lastRenderStructure[lrs++];
                    _lst2 !== undefined && !(_lst2 instanceof Node) && DOM.applyInSingleNode(null, null, [], _lst2);
                }
                return renderStructure;
            }
        }, {
            key: 'render',
            value: function render(node) {
                if (node.renderStructure !== node.lastRenderStructure && node.parentDOMElements != 0) {
                    node.attachedChildNodes = node.children.size && new Set();
                    node.lastRenderStructure = node.renderStructure = DOM.applyDOMChanges(node, node.parentDOMElements, node.renderStructure, node.lastRenderStructure);
                    node.lastParentDOMElements = node.parentDOMElements;
                    node.children.forEach(function (fieldMap) {
                        return fieldMap.forEach(function (child) {
                            return child.parentDOMElements == 0 || node.attachedChildNodes.has(child) || (child.parentDOMElements = [] /*, child.shouldRender = true */);
                        });
                    });
                } else if (node.parentDOMElements !== node.lastParentDOMElements && (node.parentDOMElements != 0 || node.lastParentDOMElements != 0)) {
                    // reposition
                    DOM.applyDOMChanges(node, node.parentDOMElements, node.lastRenderStructure, node.lastRenderStructure);
                    node.lastParentDOMElements = node.parentDOMElements;
                }
            }
        }, {
            key: 'calcRenderStructure',
            value: function calcRenderStructure(node) {
                if (node.shouldRender) {
                    node.shouldRender = false;
                    var renderStructure = node.control.render(node.lastData, node.lastError, node.attributes, node.children);
                    var pos = node.field.pos || [];
                    node.renderStructure = Array.isArray(renderStructure) ? renderStructure : [renderStructure];
                    node.immediateNodeInfo = DOM.calcImmediateNodeInfo(node.renderStructure, pos);
                    if (node.control instanceof Form) {
                        pos.forEach(function (pos, i) {
                            var info = node.immediateNodeInfo[i];
                            if (info) {
                                _extends(info, pos);
                            }
                        });
                    }
                    // TODO: what if immediateNodeInfo attributes changed but length didn't? 
                    if (node.parent && !node.parent.shouldRender && node.lastParentDOMElements.length !== node.immediateNodeInfo.length && node.parent.attachedChildNodes.has(node)) {
                        node.parent.shouldRender = true;
                    }
                }
            }
        }, {
            key: 'nodeFromElement',
            value: function nodeFromElement(runtime, domElement) {
                function isChild(parentNode) {
                    for (var e = domElement; e; e = e.parentNode) {
                        if (e === parentNode) {
                            return true;
                        }
                    }
                    return false;
                }
                var node = runtime.rootNode;
                if (node.parentDOMElements.some(isChild)) {
                    for (var step = node; step; node = step) {
                        step.children.forEach(function (map) {
                            return map.forEach(function (child) {
                                return child.parentDOMElements.some(isChild) && (step = child);
                            });
                        });
                        if (step === node) {
                            break;
                        }
                    }
                    return node;
                }
                return null;
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
                this.$node.notifications.push({ action: 'self' });
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
            key: 'renderDefault',
            value: function renderDefault() {
                return [];
            }
        }]);

        return Component;
    }();

    var fieldIndex = 0;

    var Field = function Field(clazz) {
        _classCallCheck(this, Field);

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var name = args[0],
            parameters = args[1],
            children = args[2];

        if (typeof name !== 'string') {
            children = parameters;
            parameters = name;
            name = clazz.prototype.constructor.name + '#' + ++fieldIndex;
        }
        if (Array.isArray(parameters) || parameters instanceof Field) {
            children = parameters;
            parameters = {};
        }
        if (!Array.isArray(children)) {
            children = children instanceof Field ? [children] : [];
        }
        _extends(this, parameters, { name: name, children: children, component: clazz });
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
                    field.children = clazz.fields(field.children);
                }
                return field;
            }
        }, {
            key: 'fields',
            value: function fields(children) {
                return children || [];
            }
        }]);

        return Form;
    }(Component);

    var Node = function () {
        function Node(parent, field, unboundModel, runtime) {
            _classCallCheck(this, Node);

            _extends(this, {
                parent: parent,
                runtime: runtime,
                form: null,
                field: field,
                control: null,
                dependencies: [],
                _: {},
                notifications: [],
                children: new Map(),
                erroringChildren: new Set(),
                lastData: undefined,
                lastError: undefined,
                attributes: {},
                // rendering-related part
                shouldRender: false, // until  'logic' returns something ...
                parentDOMElements: [],
                lastParentDOMElements: [],
                attachedChildNodes: new Set(),
                renderStructure: null,
                lastRenderStructure: [],
                immediateNodeInfo: [],
                unboundModel: unboundModel
            });
            var control = new field.component(this);
            var renderStructure = control.renderDefault();

            this.form = control instanceof Form ? control : parent.form;
            this.control = control;
            this.renderStructure = renderStructure && renderStructure.filter ? renderStructure : [renderStructure];
            this.immediateNodeInfo = DOM.calcImmediateNodeInfo(this.renderStructure, field.pos || []);
        }

        _createClass(Node, [{
            key: 'store',
            value: function store(value, method) {
                var setter = this.attributes.set || this.field.set;
                typeof setter === 'function' && setter.call(this.form, this.unboundModel, value, method);
            }
        }, {
            key: 'acceptLogic',
            value: function acceptLogic(data, error) {
                var childrenFields = this.field.children;
                if (typeof data !== 'undefined' && !this.evicted) {
                    if (childrenFields.length) {
                        data = (Array.isArray(data) ? data : (typeof data === 'undefined' ? 'undefined' : _typeof(data)) == 'object' ? [data] : []).map(function (d) {
                            return typeof d.withListener == 'function' ? d : new JsonProxy(d);
                        });
                        this.runtime.reconcileChildren(this, data);
                    }
                    this.lastData = data;
                    this.lastError = error;
                    this.shouldRender = true;
                }
            }
        }]);

        return Node;
    }();

    var Runtime = function () {
        function Runtime(rootElements, listener) {
            _classCallCheck(this, Runtime);

            this.schedule = [];
            this.rootElements = Array.isArray(rootElements) ? rootElements : [rootElements];
            this.listener = (listener || new DfeListener()).For();
            this.nodes = []; //new Set();
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
                clearInterval(this.processor);
            }
        }, {
            key: 'shutdown',
            value: function shutdown() {
                var _this2 = this;

                clearInterval(this.processor);
                this.nodes.forEach(function (control) {
                    return _this2.evict(control);
                });
            }
        }, {
            key: 'restart',
            value: function restart(initAction) {
                var _this3 = this;

                this.shutdown();
                this.initAction = { action: initAction || 'init' };
                if (this.rootProxy && this.formClass) {
                    this.rootNode = this.addNode(null, this.rootProxy, new Field(this.formClass, this.formClass.fields()));
                    this.rootNode.parentDOMElements = this.rootElements;
                    this.processor = setInterval(function () {
                        return _this3.processInterceptors();
                    }, 50);
                    this.processInterceptors();
                }
                return this;
            }
        }, {
            key: 'processInterceptors',
            value: function processInterceptors() {
                for (var i = 0; i < this.nodes.length; i++) {
                    this.logic(this.nodes[i]);
                }
                this.removeEvicted();
                for (var _i = this.nodes.length - 1; _i >= 0; _i--) {
                    DOM.calcRenderStructure(this.nodes[_i]);
                }
                this.nodes.forEach(function (node) {
                    return DOM.render(node);
                });
                /*let all = [];
                this.nodes.forEach(node => { this.logic(node), all.push(node) });
                all.reverse().forEach(node => DOM.calcRenderStructure(node));
                this.nodes.forEach(node => DOM.render(node));*/
                while (this.schedule.length) {
                    this.schedule.shift()(this);
                }
            }
        }, {
            key: 'addNode',
            value: function addNode(parent, modelProxy, field) {
                var unbound = wrapProxy(modelProxy, function (path) {
                    return unbound.get(path);
                }, this.listener);
                var node = new Node(parent, field, unbound, this);
                node.notifications.push(this.initAction);
                node.index = this.nodes.push(node) - 1;
                //this.nodes.add(node);
                this.prep$$(node, unbound);
                return node;
            }
        }, {
            key: 'prep$$',
            value: function prep$$(node, unbound) {
                var runtime = this;
                var listener = this.listener.For(node);
                var model = wrapProxy(unbound, function (path) {
                    return model.get(path);
                }, listener);
                var field = node.field;
                node.model = model;
                model.unbound = unbound;
                unbound.$node = model.$node = node;
                model.result = function (data) {
                    node.acceptLogic(data, node.lastError);
                };
                model.error = function (error, data) {
                    if (typeof data !== 'undefined') {
                        node.lastData = data;
                    }
                    if (node.doValidation) {
                        if (error) {
                            node.stickyError = error;
                            runtime.notifyErroring(node);
                            node.acceptLogic(node.lastData, error);
                        }
                    }
                    return error;
                };
                model.errorwatch = function (target, reducer) {
                    var error = void 0;
                    listener.get(target || node, 'erroringChildren').forEach(function (node) {
                        return error = error !== undefined && reducer ? reducer(error, node.lastError) : node.lastError;
                    });
                    error && node.acceptLogic(node.lastData, error);
                };
                model.required = function (name, pattern, message) {
                    var val = model.get(name);
                    Array.isArray(val) && (val = val[0]);
                    if (typeof val === 'undefined' || val.toString().replace(/ /g, '') === '') model.error(message || 'Required');else if (pattern === 'date' && !val.toString().match(arfDatePattern) || pattern && pattern !== 'date' && !val.match(pattern)) model.error(message || 'Invalid format');else return true;
                };
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
                var _this4 = this;

                node.evicted = true;
                node.notifications = [];
                node.children.forEach(function (fieldMap) {
                    return fieldMap.forEach(function (node) {
                        return _this4.evict(node);
                    });
                });
            }
        }, {
            key: 'removeEvicted',
            value: function removeEvicted() {
                var _this5 = this;

                var cur = 0;
                this.nodes.forEach(function (node, index) {
                    if (node.evicted) {
                        _this5.removeErroring(node);
                        var dpMap = _this5.listener.dpMap;
                        node.dependencies.forEach(function (dep) {
                            var eleMap = dpMap.get(dep.data);
                            if (eleMap) {
                                var ctlSet = eleMap.get(dep.element);
                                if (ctlSet) {
                                    ctlSet['delete'](node);
                                    ctlSet.size || eleMap['delete'](dep.element);
                                    eleMap.size || dpMap['delete'](dep.data);
                                }
                            }
                        });
                        node.lastRenderStructure.forEach(function (lst) {
                            return lst !== undefined && !(lst instanceof Node) && DOM.applyInSingleNode(null, null, [], lst);
                        });
                        node.control.destroy();
                    } else {
                        _this5.nodes[cur++] = _this5.nodes[index];
                    }
                });
                this.nodes.splice(cur);

                /*node.children.forEach(fieldMap => fieldMap.forEach( node => this.evict(node)));
                this.nodes['delete'](node);
                this.removeErroring(node);
                let dpMap = this.listener.dpMap;
                node.dependencies.forEach(dep => {
                    let eleMap = dpMap.get(dep.data);
                    if(eleMap) { 
                        let ctlSet = eleMap.get(dep.element);
                        if(ctlSet) {
                            ctlSet['delete'](node);
                            ctlSet.size || eleMap['delete'](dep.element);
                            eleMap.size || dpMap['delete'](dep.data);
                        }
                    }
                })
                node.lastRenderStructure.forEach( 
                    lst => lst !== undefined && !(lst instanceof Node) && DOM.applyInSingleNode(null, null, [], lst)
                )
                node.control.destroy();
                if( node === this.rootNode ) {
                    this.rootNode = null;
                }*/
            }
        }, {
            key: 'reconcileChildren',
            value: function reconcileChildren(parent, rowProxies) {
                var _this6 = this;

                // TODO... 
                var fpx = parent.field.children;
                var prx = parent.model.unbound;
                var pc = parent.children;
                if (pc.size || fpx.length) {
                    var fields = new Map(),
                        rows = new Map(),
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
                    pc.forEach(function (v, k) {
                        return k ? (rkeys.add(k), i++ || v.forEach(function (_, f) {
                            return fkeys.add(f);
                        })) : v.forEach(function (_, f) {
                            return skeys.add(f);
                        });
                    });
                    (fpx || []).forEach(function (fp) {
                        d = fp, fields.set(d, fp);(typeof d['class'] == 'string' && d['class'] != '' ? skeys : fkeys).add(d);
                    });
                    (rowProxies || []).forEach(function (r) {
                        rows.set(r.data, r);rkeys.add(r.data);
                    });
                    rkeys.forEach(function (r) {
                        (m = pc.get(r)) || pc.set(r, m = new Map());
                        present = rows.get(r);
                        fkeys.forEach(function (k) {
                            c = m.get(k);
                            present && (f = fields.get(k)) ? c || m.set(k, this.addNode(parent, present, f)) : c && (this.evict(c), m['delete'](k));
                        }, _this6);
                        m.size || pc['delete'](r);
                    });
                    m = pc.get(null) || new Map();
                    skeys.forEach(function (k) {
                        c = m.get(k);
                        (f = fields.get(k)) ? c || m.set(k, _this6.addNode(parent, prx, f)) : c && (_this6.evict(c), m['delete'](k));
                    });
                    m.size ? pc.set(null, m) : pc['delete'](null);
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
                            l = m.listener,
                            v,
                            fg,
                            fv;
                        //m.events = events;
                        var attrs = node.attributes = typeof d.atr != 'function' ? {} : d.atr.call(node.form, m);
                        node.doValidation = attrs.errorwatch || node.control.doValidation(events, attrs);
                        this.removeErroring(node);
                        typeof (v = typeof (fg = d.get || attrs.get) != 'function' ? [m] : fg.call(node.form, m, events)) == 'undefined' || m.result(v);
                        if (attrs.errorwatch) {
                            var _attrs$errorwatch = attrs.errorwatch,
                                target = _attrs$errorwatch.target,
                                reducer = _attrs$errorwatch.accept;

                            m.errorwatch(target, reducer);
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
            key: 'notifyNodes',
            value: function notifyNodes(nodes, action) {
                (typeof nodes.forEach === 'function' ? nodes : [nodes]).forEach(function (node) {
                    return node.notifications.push({ action: action || 'n' });
                });
            }
        }, {
            key: 'findChildren',
            value: function findChildren(nodes, deep, includeSelf, field, model) {
                // TODO...
                var ret = new Set(),
                    a = [];
                function traverse(control) {
                    control.children.forEach(function (v) {
                        v.forEach(function (c) {
                            (!field || c.field.name == field) && (!model || c.model.data == model.data) && ret.add(c);
                            traverse(c);
                        });
                    });
                    control.fixedChildren.forEach(function (c) {
                        (!field || c.field.name == field) && (!model || c.model.data == model.data) && ret.add(c);
                        traverse(c);
                    });
                }
                (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (c) {
                    includeSelf && (!field || c.field.name == field) && (!model || c.model.data == model.data) && ret.add(c);
                    traverse(c);
                });
                ret.forEach(function (k) {
                    a.push(k);
                });
                return a;
            }
        }, {
            key: 'findNodes',
            value: function findNodes(fields, modelProxy) {
                // TODO...
                var ret = [],
                    array = Array.isArray(fields) ? fields : [fields];
                this.nodes.forEach(function (c) {
                    array.indexOf(c.field.name) != -1 && (!modelProxy || c.model.data == modelProxy.data) && ret.push(c);
                });
                return ret;
            }
        }], [{
            key: 'startRuntime',
            value: function startRuntime(arg) {
                var m = arg.model,
                    j = m instanceof JsonProxy || typeof m.shadow == 'function',
                    listener = j && m.listener || arg.listener || new DfeListener(),
                    runtime = new Runtime(arg.node, listener);
                for (var v in arg.params) {
                    runtime[v] = arg.params[v];
                }j ? runtime.model_proxy = m.withListener(runtime.listener.For()) : runtime.setModel(m);
                runtime.setDfeForm(arg.form).restart(arg.initAction);
                arg.ready && arg.ready(runtime, dfe, arg.model);
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
        Component: Component
    };
});

/*

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
	        // TODO: this is used to set attribute of subform and it kind of "mutates". Do something about whole thing
	        set : function (data, element, value, action) { if(data[element] != value) { data[element] = value; this.notify(data, element, action, value) }; return true; },
	        For: function(o) { return listener(o); }
		}
	}
    return {
        validate: function(model, form) { //model, form
            console.time('Nashorn validation took');
            var rt = new core.Runtime(null, listener()).setDfeForm(form).setModel(model).restart('validate', true), errors = [];
            rt.rootnodes.forEach(function(r) {r.erroringChildren.forEach(function(c) {errors.push(c)})});
            rt.stop(); //shutdown(); //GC will do it for us?  - but stopping is necessary on client side since they have processInterceptors loop going
            var e = errors.map(function(c) { return {field: c.field.data.name, error: c.error}});
            console.timeEnd('Nashorn validation took');
            return { result : e.length == 0, data : e};
        }
    }
});*/

define('components/base', ['dfe-core'], function (Core) {
    return function (_Core$Component) {
        _inherits(BaseComponent, _Core$Component);

        function BaseComponent() {
            _classCallCheck(this, BaseComponent);

            return _possibleConstructorReturn(this, (BaseComponent.__proto__ || Object.getPrototypeOf(BaseComponent)).apply(this, arguments));
        }

        _createClass(BaseComponent, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                return data.toString();
            }
        }, {
            key: 'renderDefault',
            value: function renderDefault() {
                return [undefined];
            }
        }]);

        return BaseComponent;
    }(Core.Component);
});

define('components/container', ['dfe-core'], function (Core) {
    return function (_Core$Component2) {
        _inherits(Container, _Core$Component2);

        function Container() {
            _classCallCheck(this, Container);

            return _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).apply(this, arguments));
        }

        return Container;
    }(Core.Component);
});

define('components/either', ['dfe-core'], function (Core) {
    return function (_Core$Component3) {
        _inherits(Either, _Core$Component3);

        function Either() {
            _classCallCheck(this, Either);

            return _possibleConstructorReturn(this, (Either.__proto__ || Object.getPrototypeOf(Either)).apply(this, arguments));
        }

        _createClass(Either, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var first = void 0,
                    rest = [];
                children.forEach(function (map) {
                    return map.forEach(function (child) {
                        return first ? attributes.first || rest.push(child) : first = child;
                    });
                });
                return attributes.first ? first : rest;
            }
        }]);

        return Either;
    }(Core.Component);
});

define('components/text', ['components/base'], function (BaseComponent) {
    return function (_BaseComponent) {
        _inherits(Text, _BaseComponent);

        function Text() {
            _classCallCheck(this, Text);

            return _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).apply(this, arguments));
        }

        return Text;
    }(BaseComponent);
});

define('components/span', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent2) {
        _inherits(Span, _BaseComponent2);

        function Span() {
            _classCallCheck(this, Span);

            return _possibleConstructorReturn(this, (Span.__proto__ || Object.getPrototypeOf(Span)).apply(this, arguments));
        }

        _createClass(Span, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var sub = [];
                children.forEach(function (map, row) {
                    return map.forEach(function (child) {
                        return sub.push(Core.createElement('span', { key: row ? row.key : 0 }, child));
                    });
                });
                return Core.createElement('span', attributes, sub);
            }
        }]);

        return Span;
    }(BaseComponent);
});

define('components/div', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent3) {
        _inherits(Span, _BaseComponent3);

        function Span() {
            _classCallCheck(this, Span);

            return _possibleConstructorReturn(this, (Span.__proto__ || Object.getPrototypeOf(Span)).apply(this, arguments));
        }

        _createClass(Span, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var sub = [];
                children.forEach(function (map, row) {
                    return map.forEach(function (child) {
                        return sub.push(Core.createElement('div', { key: row ? row.key : 0 }, child));
                    });
                });
                return Core.createElement('div', attributes, sub);
            }
        }]);

        return Span;
    }(BaseComponent);
});

define('components/table', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent4) {
        _inherits(Table, _BaseComponent4);

        function Table() {
            _classCallCheck(this, Table);

            return _possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).apply(this, arguments));
        }

        _createClass(Table, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var headerClass = attributes.rowclass$header,
                    headerStyle = attributes.rowstyle$header,
                    footerClass = attributes.rowclass$footer,
                    footerStyle = attributes.rowstyle$footer,
                    rowClass = attributes.rowclass,
                    rowStyle = attributes.rowstyle,
                    skip = attributes.skip,
                    colOrder = attributes.colOrder,
                    filter = attributes.filter,
                    order = attributes.order,
                    rest = _objectWithoutProperties(attributes, ['rowclass$header', 'rowstyle$header', 'rowclass$footer', 'rowstyle$footer', 'rowclass', 'rowstyle', 'skip', 'colOrder', 'filter', 'order']);

                data = this.orderFilterRows(data, filter, order).map(function (row) {
                    return row.data;
                });
                var columns = this.orderFilterFields(skip, colOrder);
                var head = this.makeRows(columns, [null], children, 'header', { style: headerStyle, class: headerClass }, 'tr', 'th');
                var foot = this.makeRows(columns, [null], children, 'footer', { style: footerStyle, class: footerClass }, 'tr', 'td');
                var body = this.makeRows(columns, data, children, '', { style: rowStyle, class: rowClass }, 'tr', 'td');
                return Core.createElement('table', rest, [head.length && Core.createElement('thead', {}, head), body.length && Core.createElement('tbody', {}, body), foot.length && Core.createElement('tfoot', {}, foot)]);
            }
        }, {
            key: 'makeRows',
            value: function makeRows(orderedFilteredColumns, orderedFilteredRows, children, clazz, rowAttributes, rowElement, cellElement) {
                var rows = [];
                orderedFilteredRows.forEach(function (row) {
                    var map = children.get(row),
                        current = void 0;
                    if (map) {
                        orderedFilteredColumns.forEach(function (field) {
                            if ((field.class || '') === clazz) {
                                var child = map.get(field);
                                if (child) {
                                    var ii = child.immediateNodeInfo[0];
                                    if (current === undefined || ii && ii.newRow) {
                                        rows.push(current = Core.createElement(rowElement, _extends({ key: row ? row.key : 0 }, rowAttributes)));
                                    }
                                    current.children.push(Core.createElement(cellElement, child));
                                }
                            }
                        });
                    }
                });
                return rows;
            }
        }, {
            key: 'orderFilterFields',
            value: function orderFilterFields(skip, colOrder) {
                var field = this.$node.field,
                    form = this.$node.form;
                var children = skip ? field.children.filter(function (field) {
                    return typeof skip === 'function' ? !skip.call(form, field.name) : skip.indexOf(field.name) === -1;
                }) : field.children;
                return typeof colOrder === 'function' ? children.sort(function (c1, c2) {
                    return colOrder.call(form, c1.name, c2.name);
                }) : children;
            }
        }, {
            key: 'orderFilterRows',
            value: function orderFilterRows(allRows, filter, order) {
                if (typeof filter == 'function') {
                    allRows = allRows.filter(filter);
                }
                return typeof order == 'function' ? allRows.sort(order) : allRows;
            }
        }]);

        return Table;
    }(BaseComponent);
});

define('components/div-r', ['dfe-core', 'components/table'], function (Core, Table) {
    return function (_Table) {
        _inherits(DivR, _Table);

        function DivR() {
            _classCallCheck(this, DivR);

            return _possibleConstructorReturn(this, (DivR.__proto__ || Object.getPrototypeOf(DivR)).apply(this, arguments));
        }

        _createClass(DivR, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var headerClass = attributes.rowclass$header,
                    headerStyle = attributes.rowstyle$header,
                    footerClass = attributes.rowclass$footer,
                    footerStyle = attributes.rowstyle$footer,
                    rowClass = attributes.rowclass,
                    rowStyle = attributes.rowstyle,
                    skip = attributes.skip,
                    colOrder = attributes.colOrder,
                    filter = attributes.filter,
                    order = attributes.order,
                    rest = _objectWithoutProperties(attributes, ['rowclass$header', 'rowstyle$header', 'rowclass$footer', 'rowstyle$footer', 'rowclass', 'rowstyle', 'skip', 'colOrder', 'filter', 'order']);

                data = this.orderFilterRows(data, filter, order).map(function (row) {
                    return row.data;
                });
                var columns = this.orderFilterFields(skip, colOrder);
                return Core.createElement('div', rest, [].concat(_toConsumableArray(this.makeRows(columns, [null], children, 'header', { style: headerStyle, class: headerClass }, 'div', 'div')), _toConsumableArray(this.makeRows(columns, data, children, '', { style: rowStyle, class: rowClass }, 'div', 'div')), _toConsumableArray(this.makeRows(columns, [null], children, 'footer', { style: footerStyle, class: footerClass }, 'div', 'div'))));
            }
        }]);

        return DivR;
    }(Table);
});

define('components/labeled-component', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent5) {
        _inherits(Labeled, _BaseComponent5);

        function Labeled() {
            _classCallCheck(this, Labeled);

            return _possibleConstructorReturn(this, (Labeled.__proto__ || Object.getPrototypeOf(Labeled)).apply(this, arguments));
        }

        _createClass(Labeled, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var firstChild = void 0;
                children.forEach(function (map) {
                    return map.forEach(function (child) {
                        return firstChild || (firstChild = child);
                    });
                });
                return [[attributes.html ? Core.createElement('span', attributes) : attributes.text, error && !attributes.hideError && Core.createElement('label', { class: 'dfe-error', text: error.toString() })], firstChild];
            }
        }, {
            key: 'renderDefault',
            value: function renderDefault() {
                return [undefined, undefined];
            }
        }]);

        return Labeled;
    }(BaseComponent);
});

define('components/validation-component', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent6) {
        _inherits(ValidationComponent, _BaseComponent6);

        function ValidationComponent() {
            _classCallCheck(this, ValidationComponent);

            return _possibleConstructorReturn(this, (ValidationComponent.__proto__ || Object.getPrototypeOf(ValidationComponent)).apply(this, arguments));
        }

        _createClass(ValidationComponent, [{
            key: 'doValidation',
            value: function doValidation(events, attrs) {
                var vs = (attrs.vstrategy || '').split(' ');
                delete attrs.vstrategy;
                if (vs.indexOf('none') != -1 || vs.indexOf('disabled') == -1 && (attrs.disabled || attrs.hidden)) {
                    return false;
                }
                if (vs.indexOf('always') != -1 || vs.indexOf('followup') != -1 && this.$node.stickyError) {
                    return true;
                }
                if (vs.indexOf('notified') != -1 && events[0].action != 'init') {
                    return true;
                }
                return this.$node.lastError || events.some(function (e) {
                    return 'validate' === e.action;
                });
            }
        }, {
            key: 'render',
            value: function render(data, error, attributes, children) {
                return error && !attributes.hideError && Core.createElement('label', { class: 'dfe-error', text: error.toString() });
            }
        }]);

        return ValidationComponent;
    }(BaseComponent);
});

define('components/editbox', ['dfe-core', 'components/validation-component', 'components/date-picker-polyfill'], function (Core, ValidationComponent) {
    function Patterning(v, p) {
        while (p && v != 0 && !(v.match(p) && v.match(p)[0] == v)) {
            v = v.substr(0, v.length - 1);
        }
        return v;
    }
    function Formatting(value, format) {
        // aka XXX-XXX-XXXX or MM/DD/YYYY
        if (format && typeof value !== 'undefined') {
            var ret = '',
                i = void 0,
                j = void 0,
                vn = void 0,
                vl = void 0,
                fn = void 0,
                fl = void 0;
            value = (Array.isArray(value) ? value[0] : value).toString().replace(/\W/g, '');
            for (i = 0, j = 0; i < format.length && j < value.length; i++) {
                vn = !(vl = value.charAt(j).match(/[A-Z]/i)) && !isNaN(parseInt(value.charAt(j)));
                fn = !(fl = format.charAt(i) == '_') && 'XdDmMyY9'.indexOf(format.charAt(i)) >= 0;
                if (fl && !vl || fn && !vn) break;
                ret += fl && vl || fn && vn ? value.charAt(j++) : format.charAt(i);
            }
            value = ret;
        }
        return value || '';
    }
    return function (_ValidationComponent) {
        _inherits(Editbox, _ValidationComponent);

        function Editbox(node) {
            _classCallCheck(this, Editbox);

            var _this17 = _possibleConstructorReturn(this, (Editbox.__proto__ || Object.getPrototypeOf(Editbox)).call(this, node));

            _this17.ca = 0;
            _this17.events = {
                onKeyDown: function onKeyDown(e) {
                    return _this17.onKeyDown(e);
                },
                onKeyUp: function onKeyUp(e) {
                    return _this17.onKeyUp(e);
                },
                onChange: function onChange(e) {
                    return _this17.onKeyUp(e, true);
                }
            };
            return _this17;
        }

        _createClass(Editbox, [{
            key: 'onKeyUp',
            value: function onKeyUp(e, doStore) {
                doStore = doStore || this.trigger !== 'store';
                var data = Patterning(Formatting(e.target.value, this.format), this.pattern);
                var transform = typeof this.transform === 'string' && this.transform.split('').map(function (s) {
                    return +s;
                });
                if (transform) {
                    var t = [];
                    for (var i = 0; i < transform.length; i++) {
                        data.length > transform[i] && (t[i] = data.charAt(transform[i]));
                    }for (var _i2 = 0; _i2 < t.length; _i2++) {
                        t[_i2] = t[_i2] || ' ';
                    }data = t.join('');
                }
                this.getValueProcessed(data, e.target);
                doStore && this.store(data);
            }
        }, {
            key: 'onKeyDown',
            value: function onKeyDown(e) {
                var ui = e.target,
                    s = ui.selectionStart,
                    v = ui.value;
                if ((e.key == 'Backspace' || e.key == 'Delete' || e.key == 'Del') && this.format && v.length != ui.selectionEnd) {
                    e.preventDefault();
                    s && (ui.selectionEnd = --ui.selectionStart);
                }
                if (!e.key || e.key.length > 1 || e.ctrlKey) return;
                if (this.format) {
                    this.ca++;
                    if (e.key == this.format[s]) {
                        ui.selectionStart++;e.preventDefault();return;
                    }
                    while (this.format[s] && '_XdDmMyY9'.indexOf(this.format[s]) == -1) {
                        s++;
                    }var ol = v.length,
                        nl = Formatting(v.substr(0, s) + e.key + v.substr(s + 1), this.format).length;
                    if (s < ol && nl >= ol || s >= ol && nl > ol) {
                        ui.value = ui.value.substr(0, s) + ui.value.substr(s + 1);
                        ui.selectionEnd = s;
                    } else {
                        e.preventDefault();
                        return;
                    }
                }
                if (this.pattern) {
                    m = (v = ui.value.substr(0, s) + e.key + ui.value.substr(ui.selectionEnd)).match(this.pattern);
                    (!m || m[0] != v) && (this.ca--, e.preventDefault());
                }
            }
        }, {
            key: 'getValueProcessed',
            value: function getValueProcessed(data, ui) {
                var transform = typeof this.transform === 'string' && this.transform.split('').map(function (s) {
                    return +s;
                });
                if (transform) {
                    var t = [];
                    for (var i = 0; i < data.length; i++) {
                        transform.length > i && (t[transform[i]] = data.charAt(i));
                    }data = t.join('');
                }
                data = Patterning(Formatting(data, this.format), this.pattern);
                if (ui && data != ui.value) {
                    if (document.activeElement === ui) {
                        var v = ui.value,
                            ss = ui.selectionStart;
                        ui.value = data;
                        if (this.format && ss >= this.ca && ss <= v.length && v != ui.value) {
                            var over = this.format.substr(ss - this.ca, this.ca).replace(/[_XdDmMyY9]/g, '').length;
                            ui.selectionEnd = ui.selectionStart = ss + over;
                        }
                    } else {
                        ui.value = data;
                    }
                    this.ca = 0;
                }
                return data;
            }
        }, {
            key: 'render',
            value: function render(data, error, attributes, children) {
                var format = attributes.formatting,
                    pattern = attributes.pattern,
                    transform = attributes.transform,
                    trigger = attributes.trigger,
                    hideError = attributes.hideError,
                    rest = _objectWithoutProperties(attributes, ['formatting', 'pattern', 'transform', 'trigger', 'hideError']);

                _extends(this, { format: format, pattern: pattern, transform: transform, trigger: trigger });
                return [[Core.createElement('input', _extends({}, rest, this.events, { value: this.getValueProcessed(data.toString()) })), _get(Editbox.prototype.__proto__ || Object.getPrototypeOf(Editbox.prototype), 'render', this).call(this, null, error, { hideError: hideError })]];
            }
        }]);

        return Editbox;
    }(ValidationComponent);
});

define('components/editbox-$', ['components/editbox'], function (Editbox) {
    function Formatting(v, n, l) {
        do {
            v = (n ? '' : '$') + v.replace(/[^\d]/g, '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        } while (l && v.length > l && (v = v.substr(0, v.length - 1)));
        return v;
    }

    return function (_Editbox) {
        _inherits(EditboxMoney, _Editbox);

        function EditboxMoney() {
            _classCallCheck(this, EditboxMoney);

            return _possibleConstructorReturn(this, (EditboxMoney.__proto__ || Object.getPrototypeOf(EditboxMoney)).apply(this, arguments));
        }

        _createClass(EditboxMoney, [{
            key: 'onKeyUp',
            value: function onKeyUp(e, store) {
                var ui = e.target,
                    data = this.getValueProcessed(ui.value, ui);
                store && this.store(data);
            }
        }, {
            key: 'onKeyDown',
            value: function onKeyDown(e) {
                var ui = e.target,
                    ml = (this.format && this.format.length) < Formatting(ui.value + '1', this.format && this.format.charAt(0) != '$', 99).length;
                if ((e.key == ',' || e.key == 'Delete' || e.key == 'Del') && ui.value.charAt(ui.selectionStart) == ',') ui.selectionStart++;
                if ((e.key == 'Delete' || e.key == 'Del') && ui.value.charAt(ui.selectionStart) == '$') ui.selectionStart++;
                !e.ctrlKey && e.key && e.key.length == 1 && ui.selectionStart == ui.selectionEnd && (e.key < '0' || e.key > '9' || ml) && e.preventDefault();
            }
        }, {
            key: 'getValueProcessed',
            value: function getValueProcessed(data, ui) {
                Array.isArray(data) && (data = data[0]);
                data = typeof data == 'string' || typeof data == 'number' ? Formatting(data, this.format && this.format.charAt(0) != '$', this.format && this.format.length) : '';
                if (data === '$') data = '';
                if (ui && data != ui.value) {
                    var ss = ui.selectionStart,
                        ov = ui.value,
                        o = 0;
                    ui.value = data;
                    if (document.activeElement == ui) {
                        for (var i = 0; i < ss; i++) {
                            (data.charAt(i) == ',' || data.charAt(i) == '$') && o++;
                            (ov.charAt(i) == ',' || ov.charAt(i) == '$') && o--;
                        }
                        ui.selectionStart = ui.selectionEnd = ss + o - (ov.charAt(ss) == ',' && data.charAt(ss + o - 1) == ',' ? 1 : 0);
                    }
                }
                return data;
            }
        }]);

        return EditboxMoney;
    }(Editbox);
});

define('components/button', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    return function (_ValidationComponent2) {
        _inherits(Button, _ValidationComponent2);

        function Button() {
            _classCallCheck(this, Button);

            return _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).apply(this, arguments));
        }

        _createClass(Button, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this20 = this;

                var value = data.toString(),
                    hideError = attributes.hideError,
                    rest = _objectWithoutProperties(attributes, ['hideError']);
                return [[Core.createElement('input', _extends({}, rest, { value: value, type: 'button', onClick: function onClick() {
                        return _this20.store(value, 'click');
                    } })), _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'render', this).call(this, null, error, { hideError: hideError })]];
            }
        }]);

        return Button;
    }(ValidationComponent);
});

define('components/checkbox', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    return function (_ValidationComponent3) {
        _inherits(Checkbox, _ValidationComponent3);

        function Checkbox() {
            _classCallCheck(this, Checkbox);

            return _possibleConstructorReturn(this, (Checkbox.__proto__ || Object.getPrototypeOf(Checkbox)).apply(this, arguments));
        }

        _createClass(Checkbox, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this22 = this;

                if (Array.isArray(data)) {
                    data = data[0];
                }

                var hideError = attributes.hideError,
                    rest = _objectWithoutProperties(attributes, ['hideError']);

                var checked = data && ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' ? data.checked && data.checked.toString().match(/Y|y/) : data.toString().match(/Y|y/));
                var text = (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && data.text;
                return [[Core.createElement('input', _extends({}, rest, { checked: !!checked, type: 'checkbox', onChange: function onChange(e) {
                        return _this22.store(e.target.checked ? 'Y' : 'N');
                    } })), text, _get(Checkbox.prototype.__proto__ || Object.getPrototypeOf(Checkbox.prototype), 'render', this).call(this, null, error, { hideError: hideError })]];
            }
        }]);

        return Checkbox;
    }(ValidationComponent);
});

define('components/dropdown', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    function testChoice(a, b) {
        return a == b || (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' && (typeof b === 'undefined' ? 'undefined' : _typeof(b)) === 'object' && Object.getOwnPropertyNames(a).every(function (i) {
            return a[i] == b[i];
        });
    }
    return function (_ValidationComponent4) {
        _inherits(Dropdown, _ValidationComponent4);

        function Dropdown() {
            _classCallCheck(this, Dropdown);

            return _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).apply(this, arguments));
        }

        _createClass(Dropdown, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this24 = this;

                var def = attributes['default'],
                    hideError = attributes.hideError,
                    rest = _objectWithoutProperties(attributes, ['default', 'hideError']);

                var options = def ? [{ text: 'Please select...', value: def }] : [];
                var selectedIndex = 0;
                if (Array.isArray(data.items)) {
                    options = options.concat(data.items.map(function (item) {
                        return (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' ? { text: item.description || item.value.toString(), value: item.value } : { text: item.toString(), value: item };
                    }));
                }
                options.forEach(function (item, i) {
                    return testChoice(data.value, item.value) && (selectedIndex = i);
                });
                return [[Core.createElement('select', _extends({}, rest, { selectedIndex: selectedIndex, onChange: function onChange(e) {
                        return _this24.store(options[e.target.selectedIndex].value);
                    } }), options.map(function (opt) {
                    return Core.createElement('option', { text: opt.text });
                })), _get(Dropdown.prototype.__proto__ || Object.getPrototypeOf(Dropdown.prototype), 'render', this).call(this, null, error, { hideError: hideError })]];
            }
        }, {
            key: 'renderDefault',
            value: function renderDefault() {
                return Core.createElement('select');
            }
        }]);

        return Dropdown;
    }(ValidationComponent);
});

define('components/html', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent7) {
        _inherits(Html, _BaseComponent7);

        function Html() {
            _classCallCheck(this, Html);

            return _possibleConstructorReturn(this, (Html.__proto__ || Object.getPrototypeOf(Html)).apply(this, arguments));
        }

        _createClass(Html, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                return Core.createElement('span', _extends({}, attributes, { html: data }));
            }
        }]);

        return Html;
    }(BaseComponent);
});

define('components/form', ['dfe-core', 'components/div'], function (Core, Div) {
    return function (_Div) {
        _inherits(Form, _Div);

        function Form() {
            _classCallCheck(this, Form);

            return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var name = attributes.name,
                    id = attributes.id,
                    action = attributes.action,
                    method = attributes.method,
                    target = attributes.target,
                    rest = _objectWithoutProperties(attributes, ['name', 'id', 'action', 'method', 'target']);

                return Core.createElement('form', { name: name, id: id, action: action, method: method, target: target }, [_get(Form.prototype.__proto__ || Object.getPrototypeOf(Form.prototype), 'render', this).call(this, data, error, rest, children)]);
            }
        }]);

        return Form;
    }(Div);
});

define('components/tab-s', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent8) {
        _inherits(TabS, _BaseComponent8);

        function TabS(node) {
            _classCallCheck(this, TabS);

            var _this27 = _possibleConstructorReturn(this, (TabS.__proto__ || Object.getPrototypeOf(TabS)).call(this, node));

            _this27.activeTab = -1;
            _this27.lastRows = new Set();
            return _this27;
        }

        _createClass(TabS, [{
            key: 'setActiveTab',
            value: function setActiveTab(key) {
                this.activeTab = key;
                this.update();
            }
        }, {
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this28 = this;

                var headerClass = attributes.rowclass$header,
                    headerStyle = attributes.rowstyle$header,
                    rowClass = attributes.rowclass,
                    rowStyle = attributes.rowstyle,
                    headField = attributes.headField,
                    focusnew = attributes.focusnew,
                    haclass = attributes.haclass,
                    rest = _objectWithoutProperties(attributes, ['rowclass$header', 'rowstyle$header', 'rowclass', 'rowstyle', 'headField', 'focusnew', 'haclass']),
                    curRows = new Set(),
                    activeTab = void 0;

                var head = Core.createElement('div', { class: headerClass, style: headerStyle });
                var body = Core.createElement('div', { class: rowClass, style: rowStyle });
                data.forEach(function (proxy) {
                    var key = proxy.data.key;
                    _this28.lastRows.has(key) || focusnew && (_this28.activeTab = key);
                    activeTab = !activeTab || _this28.activeTab === key ? key : activeTab;
                    curRows.add(key);
                });
                this.activeTab = activeTab;
                this.lastRows = curRows;
                children.forEach(function (map, row) {
                    if (row) {
                        map.forEach(function (child, field) {
                            if (field.name === headField) {
                                head.children.push(Core.createElement('div', child, function (pos) {
                                    return _extends({}, pos, row.key === activeTab ? { class: (pos.class ? pos.class + ' ' : '') + haclass } : {}, {
                                        onClick: function onClick() {
                                            return _this28.setActiveTab(row.key);
                                        }
                                    });
                                }));
                            } else {
                                row.key === activeTab && body.children.push(Core.createElement('div', child));
                            }
                        });
                    }
                });
                return Core.createElement('div', rest, [head, body]);
            }
        }]);

        return TabS;
    }(BaseComponent);
});

define('components/tab-d', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    var ActiveTabHandler = function () {
        function ActiveTabHandler() {
            _classCallCheck(this, ActiveTabHandler);
        }

        _createClass(ActiveTabHandler, [{
            key: 'prepare',
            value: function prepare(children) {
                throw new Error('Not implemented');
            }
        }, {
            key: 'activeTab',
            value: function activeTab(model) {
                throw new Error('Not implemented');
            }
        }, {
            key: 'store',
            value: function store(model) {}
        }]);

        return ActiveTabHandler;
    }();

    return function (_BaseComponent9) {
        _inherits(TabD, _BaseComponent9);

        function TabD(node) {
            _classCallCheck(this, TabD);

            var _this29 = _possibleConstructorReturn(this, (TabD.__proto__ || Object.getPrototypeOf(TabD)).call(this, node));

            _this29.handler = new ActiveTabHandler(_this29);
            return _this29;
        }

        _createClass(TabD, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this30 = this;

                var headerClass = attributes.rowclass$header,
                    headerStyle = attributes.rowstyle$header,
                    rowClass = attributes.rowclass,
                    rowStyle = attributes.rowstyle,
                    haclass = attributes.haclass,
                    activeTab = attributes.activeTab,
                    rest = _objectWithoutProperties(attributes, ['rowclass$header', 'rowstyle$header', 'rowclass', 'rowstyle', 'haclass', 'activeTab']);

                var useHandler = typeof activeTab !== 'function';
                if (useHandler) {
                    this.handler.prepare(children);
                }

                var head = Core.createElement('div', { class: headerClass, style: headerStyle });
                var body = Core.createElement('div', { class: rowClass, style: rowStyle });
                var headField = this.$node.field.children.filter(function (field) {
                    return !field.class;
                }).pop();
                data.forEach(function (model) {
                    var child = children.get(model.data).get(headField),
                        isActive = (useHandler ? _this30.handler.activeTab : activeTab)(model);
                    if (child) {
                        head.children.push(Core.createElement('div', child, function (pos) {
                            return _extends({}, pos, isActive ? { class: (pos.class ? pos.class + ' ' : '') + haclass } : {}, {
                                onClick: function onClick() {
                                    return _this30.handler.store(model), _this30.store(model);
                                }
                            });
                        }));
                    }
                });
                children.get(null).forEach(function (child, field) {
                    return field.name === (useHandler ? _this30.handler.activeTab : activeTab)() && body.children.push(Core.createElement('div', child));
                });
                return Core.createElement('div', rest, [head, body]);
            }
        }]);

        return TabD;
    }(BaseComponent);
});

define('components/div-c', ['dfe-core', 'components/table'], function (Core, Table) {
    return function (_Table2) {
        _inherits(DivC, _Table2);

        function DivC() {
            _classCallCheck(this, DivC);

            return _possibleConstructorReturn(this, (DivC.__proto__ || Object.getPrototypeOf(DivC)).apply(this, arguments));
        }

        _createClass(DivC, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this32 = this;

                var rowClass = attributes.rowclass,
                    rowStyle = attributes.rowstyle,
                    skip = attributes.skip,
                    colOrder = attributes.colOrder,
                    filter = attributes.filter,
                    order = attributes.order,
                    rest = _objectWithoutProperties(attributes, ['rowclass', 'rowstyle', 'skip', 'colOrder', 'filter', 'order']);

                var fields = {
                    header: [],
                    footer: [],
                    "": []
                };
                var rows = this.orderFilterRows(data, filter, order);
                this.orderFilterFields(skip, colOrder).forEach(function (field) {
                    return fields[field.class || ''].push(field);
                });
                var columns = fields[""].map(function (field) {
                    return Core.createElement('div', { key: field.name, style: rowStyle, class: rowClass });
                });
                this.toColumns(children.get(null), fields.header, columns);
                rows.forEach(function (model) {
                    return _this32.toColumns(children.get(model.data), fields[""], columns);
                });
                this.toColumns(children.get(null), fields.footer, columns);
                return Core.createElement('div', rest, columns);
            }
        }, {
            key: 'toColumns',
            value: function toColumns(map, fields, out) {
                if (map) {
                    map.forEach(function (child, field) {
                        var column = out[fields.indexOf(field)];
                        if (column) {
                            column.children.push(Core.createElement('div', child));
                        }
                    });
                }
            }
        }]);

        return DivC;
    }(Table);
});

define('components/radiolist', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    function testChoice(a, b) {
        return a == b || (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' && (typeof b === 'undefined' ? 'undefined' : _typeof(b)) === 'object' && Object.getOwnPropertyNames(a).every(function (i) {
            return a[i] == b[i];
        });
    }
    var radioNameCounter = 0;
    return function (_ValidationComponent5) {
        _inherits(Radiolist, _ValidationComponent5);

        function Radiolist(node) {
            _classCallCheck(this, Radiolist);

            var _this33 = _possibleConstructorReturn(this, (Radiolist.__proto__ || Object.getPrototypeOf(Radiolist)).call(this, node));

            _this33.defaultName = 'Radiolist#' + ++radioNameCounter;
            return _this33;
        }

        _createClass(Radiolist, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this34 = this;

                var orientation = attributes.orientation,
                    hideError = attributes.hideError,
                    rest = _objectWithoutProperties(attributes, ['orientation', 'hideError']);

                var normalized = (Array.isArray(data) ? data[0] : data) || 'N';
                if (typeof normalized === 'string') {
                    normalized = { value: data, items: [{ value: 'Y', description: 'Yes' }, { value: 'N', description: 'No' }] };
                }
                return [[].concat(_toConsumableArray(Array.prototype.concat.apply([], normalized.items.map(function (item) {
                    return [Core.createElement('input', _extends({
                        name: _this34.defaultName
                    }, rest, {
                        type: 'radio',
                        checked: testChoice(normalized.value, item.value),
                        onChange: function onChange() {
                            return _this34.store(item.value);
                        }
                    })), item.description || item.value.toString(), orientation === 'vertical' && Core.createElement('br')];
                }))), [_get(Radiolist.prototype.__proto__ || Object.getPrototypeOf(Radiolist.prototype), 'render', this).call(this, null, error, { hideError: hideError })])];
            }
        }]);

        return Radiolist;
    }(ValidationComponent);
});

/*

define('components/iframe', ['components/component', 'ui/utils'], function(Component, uiUtils) {
    return _extend({
        cname: 'iframe',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('iframe'))._dfe_ = control;
                    this.setEvents(control.ui, control, data, errs, attrs);
                }
                uiUtils.setAttribute(control.ui, 'src', data.toString());
                this.setAttributes(control, errs, attrs);
                this.appendError(control, nodes[0], errs, attrs);
            }
        }
    }, Component, _base())
})    

define('components/textarea', ['components/editbox', 'ui/utils'], function(CEditbox, uiUtils) {
    return _extend({
        cname: 'textarea',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('textarea'))._dfe_ = control;
                    function store() { delete control.inputLock; control.component.store(control, control.ui.value);  }
                    uiUtils.addEventListener(control.ui, 'keydown', function() { control.inputLock = true; })
                    uiUtils.addEventListener(control.ui, attrs.trigger||'keyup', store );
                    attrs.trigger == 'change' || uiUtils.addEventListener(control.ui, 'change', store);
                    this.setEvents(control.ui, control, data, errs, attrs);
                }
                if(control.ui.value != data && !control.inputLock) control.ui.value = data;
                this.setAttributes(control, errs, attrs);
                this.appendError(control, nodes[0], errs, attrs);
            }
        }
    }, CEditbox, _base())
})

define('components/editbox-P', ['components/editbox', 'ui/utils'], function(CEditbox, uiUtils) {
    return _extend({
        cname: 'editbox-P',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                var rt = this.runtime(control), self = this;
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('input'))._dfe_ = control;
                    uiUtils.addEventListener(control.ui, 'focus', function(e) { self.showPopup(control) });
                    uiUtils.addEventListener(control.ui, 'click', function(e) { self.showPopup(control) });
                    uiUtils.addEventListener(control.ui, attrs.trigger || 'keyup', function(e) { control.currentValue === control.ui.value || control.component.store(control, control.ui.value) });
                    uiUtils.addEventListener(control.ui, 'keydown', function(e) { 
                        (e.key == 'Esc' || e.key == 'Escape') && rt.ta && control.closePopup();
                        e.key == 'Enter' && (e.preventDefault(), self.showPopup(control), self.getPopupActiveElement(control).focus());
                        e.key == 'Tab' && rt.ta && (self.getPopupActiveElement(control).focus(), e.preventDefault());
                    });
                }
                this.setValue(control, data, errs, attrs);
                this.setAttributes(control, errs, attrs);
                this.appendError(control, nodes[0], errs, attrs);
                this.setPopupAttributes(control, attrs.ta||{}, errs);
                this.updatePopupContent(control, data, attrs);
            }
        },
        setValue: function(control, data, errs, attrs) {
            control.ui.value === data || (control.ui.value = data);
            control.currentValue = control.ui.value;
        },
        updatePopupContent: function(control, data, attrs) {
            var rt = this.runtime(control);
            rt.ta && rt.popup && !rt.ta.contains(control.ui.ownerDocument.activeElement) && (rt.popup.value == data || (rt.popup.value = data, rt.popup.selectionStart = rt.popup.selectionEnd = 0, rt.popup.scrollTop = 0));
        },
        getPopupUi: function(control) {
            var attrs = control.model.attrs, rt = this.runtime(control), p = rt.popup;
            if(!rt.popup) { 
                rt.popup = p = control.ui.ownerDocument.createElement('textarea');
                uiUtils.setAttribute(p, 'class', 'edit-popup-textarea');
                uiUtils.addEventListener(p, attrs.trigger || 'keyup', function(){ 
                    control.component.store(control, control.ui.value = p.value);
                    control.currentValue = p.value;
                });
                uiUtils.addEventListener(p, 'keydown', function(e) { 
                    (e.key == 'Esc' || e.key == 'Escape') && (control.ui.focus(), control.closePopup()) 
                    e.key == 'Tab' && (control.ui.focus(), e.preventDefault()); // ??
                });
            }
            return p;
        },
        onResize: function(control) {},
        getPopupActiveElement: function(control) { 
            return this.runtime(control).popup 
        },
        onClosePopup: function(control) {},
        purge: function (control) { control.closePopup && rt.ta && control.closePopup(); this.emptyUI(control); },
        showPopup: function(control) {
            var rt = this.runtime(control), scrollFollow, escUnf, doc = control.ui.ownerDocument, self = this;
            if(control.ui && !rt.ta) {
                this.createPopup(control);
                this.updatePopupContent(control, control.data, control.model.attrs);
                (scrollFollow = function() {
                    var r = control.ui.getBoundingClientRect(), op = control.ui.offsetParent, wnd = doc.defaultView||window;
                    rt.ta.style.display = (op.scrollTop > control.ui.offsetTop + control.ui.offsetHeight || op.scrollTop + op.clientHeight < control.ui.offsetTop + control.ui.offsetHeight) ? 'none' : '';
                    rt.ta.style.top = (r.bottom + 2 + (wnd.scrollY||wnd.pageYOffset) + (rt.ta_t||0)) + 'px';
                    rt.ta.style.left = (r.left + (wnd.scrollX||wnd.pageXOffset) + (rt.ta_l||0)) + 'px';
                })();
                for(var e = control.ui; e; e = e.parentElement) e.addEventListener('scroll', scrollFollow);
                var i = setInterval(function() {
                    doc.activeElement != control.ui && !rt.resizeOngoing && ! rt.ta.contains(doc.activeElement) && control.closePopup();
                }, 30);
                control.closePopup = function() {
                    for(var e = control.ui; e; e = e.parentElement) uiUtils.removeEventListener(e, 'scroll', scrollFollow);
                    uiUtils.removeEventListener(self.getPopupActiveElement(control), 'keydown', escUnf);
                    clearInterval(i);
                    self.onClosePopup(control);
                    uiUtils.removeNode(rt.ta);
                    delete rt.ta;
                }
                uiUtils.addEventListener(self.getPopupActiveElement(control), 'keydown', (escUnf = function(e) { 
                    e.key == 'Escape' && !e.defaultPrevented && (control.ui.focus(), control.closePopup());
                }));
            }    
        },
        createPopup: function(control) {
            var rt = this.runtime(control), doc = control.ui.ownerDocument, attrs = control.model.attrs, handle, self = this;
            rt.ta = doc.createElement('div'); 
            rt.ta.appendChild(this.getPopupUi(control));
            rt.ta.appendChild(handle = document.createElement('span'));
            doc.getElementsByTagName('body')[0].appendChild(rt.ta);
            this.setPopupAttributes(control, attrs.ta||{}, control.error);
            handle.setAttribute('class', 'ui-resizeable-handle-br');
            handle.addEventListener('mousedown', function(ie) {
                rt.resizeOngoing = 1;
                var ox = ie.screenX, oy = ie.screenY, w = rt.ta.offsetWidth, h = rt.ta.offsetHeight, move, up;
                document.addEventListener('mousemove', move = function(me) {
                    self.onResize(control);
                    rt.ta.style.width = rt.ta_w = (w + me.screenX - ox) + 'px';
                    rt.ta.style.height = rt.ta_h = (h + me.screenY - oy) + 'px';
                    me.preventDefault(), window.getSelection().removeAllRanges();
                });
                document.addEventListener('mouseup', up = function(me) {
                    rt.resizeOngoing = 0;
                    uiUtils.removeEventListener(document, 'mousemove', move);
                    uiUtils.removeEventListener(document, 'mouseup', up);
                    self.getPopupActiveElement(control).focus();
                });
            });
        },
        setPopupAttributes: function(control, attrs, errs) {
            var rt = this.runtime(control);
            if(rt.ta) {
                var st = rt.ta.style, w = st.width||rt.ta_w, h = st.height||rt.ta_h, t = st.top, l = st.left;
                rt.ta_l = attrs.offsetLeft, rt.ta_t = attrs.offsetTop; 
                attrs['class'] = (attrs['class']||'') + (errs && attrs.eclass ? ' ' + attrs.eclass : '');
                this.setAttributesUI(rt.ta, errs, attrs);
                w && (st.width = w), h && (st.height = h), t && (st.top = t), l && (st.left = l);
            }
        }
    }, CEditbox, _base())
})

define('components/div-button', ['components/component', 'ui/utils'], function(Component, uiUtils) {
    return _extend({
        cname: 'div-button',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                    control.ui.appendChild(control.ui_text = document.createElement('label'));
                    control.ui.appendChild(control.ui_error = document.createElement('label'));
                    control.ui_text.setAttribute('class', 'div-button-text');
                    control.ui_error.setAttribute('class', attrs.eclass || 'div-button-error'); 
                    uiUtils.addEventListener(control.ui, 'click', function(e){control.component.store(control, data)});
                    this.setEvents(control.ui, control, data, errs, attrs);
                }
                var e = errs ? 'error' : '';
                if(control.ui_text.innerHTML != data) control.ui_text.innerHTML = data;
                if(control.ui_error.innerHTML != e) control.ui_error.innerHTML = e;
                this.setAttributes(control, errs, attrs);
            }
        }
    }, Component, _base())
})

define('components/multioption', ['components/component', 'ui/utils'], function(Component, uiUtils) {
    return _extend({
        cname: 'multioption',
        render: function (nodes, control, data, errs, attrs, events) {
            data.value = Array.isArray(data.value) ? data.value[0] : data.value;
            control.ui && this.emptyUI(control);
            if( data && Array.isArray(data.options) ) {
                (control.ui = document.createElement('div'))._dfe_ = control;
                this.setAttributes(control, errs, attrs);
                this.setEvents(control.ui, control, data, errs, attrs);
                var select = new Set(), d, c, cc = [];
                (typeof data.value == 'string' ? data.value.split(';') : []).forEach(function(a) { select.add(a) });
                data.options.forEach(function (o) {
                    control.ui.appendChild(d = document.createElement('div'));
                    attrs.rowclass && d.setAttribute('class', attrs.rowclass);
                    attrs.rowstyle && d.setAttribute('style', attrs.rowstyle);
                    c = document.createElement('input');
                    c.setAttribute('type', 'checkbox');
                    d.appendChild(c);
                    cc.push(c);
                    c.checked = select.has(c.value = o.value||o);
                    uiUtils.addEventListener(c, 'change', function(e){
                        control.component.store(control, cc.map(function(c) {return c.checked ? c.value : -1}).filter(function(v) {return v != -1}).join(';'));
                    }, true);
                    d.appendChild(c = document.createElement('label'));
                    c.setAttribute('style', 'align-self: center;');
                    c.innerText = (o.description || o.value || o);
                }, this);
                nodes && nodes[0].appendChild(control.ui);
            }
        }
    }, Component, _base())
})

define('components/div-button-x', ['components/div-button', 'ui/utils'], function(CDivButton, uiUtils) {
    return _extend({ 
        cname: 'div-button-x',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                CDivButton.render.call(this, nodes, control, data, errs, attrs, events);
                control.ui.style.position = 'relative';
                if(!control.ui_x) {
                    control.ui_x = document.createElement('input')
                    control.ui_x.value = 'x';
                    control.ui_x.setAttribute('type', 'button');
                    control.ui_x.setAttribute('class', 'div-button-x');
                    control.ui.appendChild(control.ui_x);
                    uiUtils.addEventListener(control.ui_x, 'click', function(e){ e.stopImmediatePropagation(); control.component.store(control, 'x') }, true);
                    this.setEvents(control.ui, control, data, errs, attrs);        
                }
                control.ui_x.style.visibility = (attrs.ta && !attrs.ta.visible) ? 'hidden' : 'visible';
            }
        }
    }, CDivButton, _base())
})

define('components/dfe-runtime', ['components/component', 'dfe-core', 'ui/utils'], function(Component, core, uiUtils) {
    var map = new Map();
    function load(f, p, c, d, e, a, t) { 
        var fform = map.get(f);
        fform||map.set(f, fform=require(['forms/'+f], function(form){ return fform.formComponent = form }));
        var k = c._deferred = fform.formComponent && p ? 0 : function(p) {c.component.render(p, c, d, e, a, t)} 
        if(!fform.formComponent) {
            fform.then(function(){
                c._deferred == k && c._deferred(p);
            })
        }
        return fform.formComponent;
    }
    return _extend({
        purge: function (control) { 
            var rt = this.runtime(control);
            rt.runtime && rt.runtime.shutdown();
            Component.purge.call(this,control); 
        },
        cname: 'dfe-runtime',
        render: function(nodes, control, data, errs, attrs, events) {
            var form = typeof attrs.form == 'object' ? attrs.form : load(attrs.form, nodes, control, data, errs, attrs, events), rt = this.runtime(control);
            Array.isArray(data)&&(data=data[0]);
            if(nodes && form) {
                form = form.form;
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                    if( form.dfe.length == 1 && form.dfe[0].component.slots == 1)
                        rt.nodes = [control.ui];
                    else
                        form.dfe.forEach(function(dfe){
                            for(var i = 0; i < dfe.component.slots; i++)
                                rt.nodes.push(control.ui.appendChild(document.createElement('div')));
                        })
                }
                uiUtils.setAttribute( control.ui, "dfe-form", form.name);
                uiUtils.setAttribute( control.ui, "dfe-edit-target", attrs.editTarget? "" : undefined);
                this.setAttributes(control, errs, attrs);
                rt.runtime && rt.runtime.shutdown();
                control.ui._dfe_runtime = rt.runtime = core.startRuntime({params: {parentControl: control}, form: form, model: data||{}, node: rt.nodes});
            }
        }
    }, Component, _base());
})

define('components/labeled-component', ['components/component', 'ui/utils'], function(Component, uiUtils) {
    return _extend({
        cname: 'labeled-component',
        slots: 2,
        renderingComponent: null,
        attachUI: function (control, nodes) {
            this.renderingComponent.attachUI(control, nodes.slice(1));
            control.captionUi && nodes[0].appendChild(control.captionUi); 
            control.captureError && control.errorUi && nodes[0].appendChild(control.errorUi);
        },
        detachUI: function (control) {
            this.renderingComponent.detachUI(control);
            uiUtils.removeNode(control.captionUi);
        },
        emptyUI: function (control) {
            this.renderingComponent.emptyUI(control);
            uiUtils.removeNode(control.captionUi);
            delete control.captionUi; 
        },
        purge: function (control) {
            this.renderingComponent.purge(control);
            uiUtils.removeNode(control.captionUi);
            delete control.captionUi; 
        },
        render: function(nodes, control, data, errs, attrs, events) { 
            if(!defer(nodes, control, data, errs, attrs, events)) {
                if(!control.captionUi) {
                    nodes[0].appendChild(control.captionUi = document.createElement('label'))._dfe_ = control;
                }
                attrs.html ? (control.captionUi.innerHTML = attrs.text) : (control.captionUi.innerText = attrs.text);
                uiUtils.setAttribute(control.captionUi, 'style', attrs.cstyle);
                var ce = attrs.captureError || this.captureError;
                if(control.captureError = typeof ce != 'function' || ce(data, errs, attrs)) {
                    this.renderingComponent.render(nodes.slice(1), control, data, 0, attrs, events);
                    this.appendError(control, nodes[0], errs, attrs);
                } else {
                    this.renderingComponent.render(nodes.slice(1), control, data, errs, attrs, events);
                }
            }
        }
    }, Component, _base());
})

define('components/c-checkbox', ['components/labeled-component', 'components/checkbox', 'ui/utils'], function(DWC, Checkbox, uiUtils) {
    return _extend({
        cname: 'c-checkbox',
        renderingComponent: Checkbox,
    }, DWC, _base())
})    

define('components/c-dropdown', ['components/labeled-component', 'components/dropdown', 'ui/utils'], function(DWC, Dropdown, uiUtils) { 	
    return _extend({
        cname: 'c-dropdown',
        renderingComponent: Dropdown,
    }, DWC, _base())
})

define('components/c-editbox', ['components/labeled-component', 'components/editbox', 'ui/utils'], function(DWC, Editbox, uiUtils) {
    return _extend({
        cname: 'c-editbox',
        captureError: function(data, errs, attrs) { return !attrs.eclass },
        renderingComponent: Editbox,
    }, DWC, _base())
})  

define('components/c-editbox-$', ['components/labeled-component', 'components/editbox-$', 'ui/utils'], function(DWC, Editbox$, uiUtils) {
    return _extend({
        cname: 'c-editbox-$',
        renderingComponent: Editbox$,
    }, DWC, _base())
})     

define('components/c-radiolist', ['components/labeled-component', 'components/radiolist', 'ui/utils'], function(DWC, Radiolist, uiUtils) {
    return _extend({
        cname: 'c-radiolist',
        renderingComponent: Radiolist,
    }, DWC, _base())
})

define('components/c-switch', ['components/labeled-component', 'components/switch', 'ui/utils'], function(DWC, Switch, uiUtils) {
    return _extend({
        cname: 'c-switch',
        renderingComponent: Switch,
    }, DWC, _base())
})   
*/

define('forms/test', ["dfe-core", "ui/shapes", 'dfe-field-helper', "components/labeled-component", "components/editbox", "components/container", "components/table", "components/button", "components/checkbox", "components/text", "components/dropdown", "components/html", "components/div-r", "components/tab-s", "components/tab-d", "components/div-c", "components/radiolist"], function (Core, shapes, _fields, Labeled, Editbox, Container, Table, Button, Checkbox, Text, Dropdown, Html, DivR, TabS, TabD, DivC, Radiolist) {
    var Form = Core.Form;

    var SubForm = function (_Form) {
        _inherits(SubForm, _Form);

        function SubForm() {
            _classCallCheck(this, SubForm);

            return _possibleConstructorReturn(this, (SubForm.__proto__ || Object.getPrototypeOf(SubForm)).apply(this, arguments));
        }

        _createClass(SubForm, null, [{
            key: 'fields',
            value: function fields() {
                return [Form.field(Container, "field-2", { get: function get($$) {
                        return $$('.showStuff') == 'Y' ? [] : [$$];
                    } }, [Form.field(Editbox, "field-3", {
                    atr: function atr() {
                        return _fields.simple('.ModelYr', { vstrategy: 'always' });
                    }
                })]), Form.field(Checkbox, "field-4", { get: function get($$) {
                        return $$('.showStuff');
                    }, set: function set($$, value) {
                        return $$.set('.showStuff', value);
                    } }), Form.field(Text, "field-5", { get: function get() {
                        return this.$node.attributes.someProperty;
                    } })];
            }
        }]);

        return SubForm;
    }(Form);

    var typeMap = {
        car: {
            name: "Private Passenger Type",
            btn: "Passenger Vehicles"
        },
        truck: {
            name: "Trucks, Tractors and Trailers"
        },
        golf: {
            name: "Golf Carts and Low Speed Vehicles"
        },
        mobile: {
            name: "Mobile Homes"
        },
        antique: {
            name: "Antique Autos"
        }
        /* return class TestForm extends Core.Form {
             static fields() {
                 return [
                     Form.field(DivC, { get: $$ => $$('policy.cmau.location.car'), atr: () => ({style: 'display: flex'})}, [
                         Form.field(Text, 'h1', { get: () => 'Vin number', class: 'header' }),
                         Form.field(Text, 'h2', { get: () => 'Type', class: 'header' }),
                         Form.field(Text, 'h3', { get: () => 'Has vin', class: 'header' }),
                         Form.field(Text, 'r1', { get: $$ => ($$('.hasvin') == 'Y' ? '' : '*') + $$('.vinnumber') }),
                         Form.field(Dropdown, 'r2', {
                             atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                                 value: k,
                                 description: typeMap[k].name
                             })))
                         }),
                         Form.field(Radiolist, 'r3', { atr: () => fields.simple('.hasvin') }) // , {orientation : 'vertical'}
                     ]),
                     Form.field(Table, { get: $$ => $$('policy.cmau.location.car') }, [
                         Form.field(TabD, 'tab-fld', { 
                             get: () => [{caption: 'This is VIN', hfield: 'h1'}, {caption: 'This is type', hfield: 'h2'}], 
                             set: ($$, px) => $$.set('.activeTab', px.get('.hfield')),
                             atr: $$ => ({
                                 activeTab: function(px) {
                                     let at = $$('.activeTab').toString() || 'h1';
                                     return px ? px.get('.hfield') == at : at;
                                 }
                             }) 
                         }, [
                             Form.field(Text, 'hRow', { get: $$ => $$('.caption') }),
                             Form.field(Text, 'h1', { get: $$ => $$('.vinnumber'), class: 'header' }),
                             Form.field(Dropdown, 'h2', {
                                 atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                                     value: k,
                                     description: typeMap[k].name
                                 }))),
                                 class: 'header'
                             })
                         ]),
                         Form.field(SubForm, "subform", { atr: $$ => ({someProperty: 'someValue#' + $$.index()}), pos: [{newRow: true}] })
                     ])
                 ]
             }
         }*/

        /*return class TestForm extends Core.Form {
            static fields() {
                return (
                    Form.field(Table, { get: $$ => $$('policy.cmau.location.car') }, [
                        Form.field(TabD, 'tab-fld', { 
                            get: () => [{caption: 'This is VIN', hfield: 'h1'}, {caption: 'This is type', hfield: 'h2'}], 
                            set: ($$, px) => $$.set('.activeTab', px.get('.hfield')),
                            atr: $$ => ({
                                activeTab: function(px) {
                                    let at = $$('.activeTab').toString() || 'h1';
                                    return px ? px.get('.hfield') == at : at;
                                }
                            }) 
                        }, [
                            Form.field(Text, 'hRow', { get: $$ => $$('.caption') }),
                            Form.field(Text, 'h1', { get: $$ => $$('.vinnumber'), class: 'header' }),
                            Form.field(Dropdown, 'h2', {
                                atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                                    value: k,
                                    description: typeMap[k].name
                                }))),
                                class: 'header'
                            })
                        ])
                    ])
                )
            }
        }*/

        /* return class TestForm extends Core.Form {
             static fields() {
                 return (
                     Form.field(TabS, 'tab-fld', { get: $$ => $$('policy.cmau.location.car'), atr: () => ({headField: 'hd-fld', haclass: "me-active"}) }, [
                         Form.field(Text, 'hd-fld', { get: $$ => $$('.vinnumber') }),
                         Form.field(Dropdown, 'bd-fld', {
                             atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                                 value: k,
                                 description: typeMap[k].name
                             })))
                         })
                     ])
                 )
             }
         }*/
        /*return class TestForm extends Core.Form {
            static fields() {
                return (
                    Form.field(Table, { get: $$ => $$('policy.cmau.location.car') }, [
                        Form.field(Html, "field-49", {
                            get: $$ => shapes.cssShape($$, $$('.hasvin') == 'Y' ? 'css-button-plus' : 'css-button-minus'),
                            atr: $$ => ({
                                events: {
                                    onClick: () => $$.set('.hasvin', $$('.hasvin') == 'Y' ? 'N' : 'Y')
                                }
                            }),
                            pos: [ {
                                style: "padding: 1px; background: white; border-radius: 3px;"
                            } ]
                        }),
                        Form.field(Dropdown, "field-1", { 
                            atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                                value: k,
                                description: typeMap[k].name
                            })))
                        }),
                        Form.field(Labeled, { atr: () => ({text: 'Some label', errorwatch: true}) }, 
                            Form.field(Dropdown, "field-2", { 
                                val: $$ => $$.required('.ModelYr', '(18|19|20)\\d{2}'),
                                atr: $$ => fields.ajaxChoice('.ModelYr', {
                                    query: {
                                        vehicleType: $$('.vehicletype'),
                                        method: 'CMAUVehicleScriptHelper',
                                        action: 'getYearOptions'
                                    }
                                }, { vstrategy: 'always', hideError: true})
                            })
                        )
                    ])
                )
            }
        }*/
    };return function (_Core$Form) {
        _inherits(TestForm, _Core$Form);

        function TestForm(node) {
            _classCallCheck(this, TestForm);

            return _possibleConstructorReturn(this, (TestForm.__proto__ || Object.getPrototypeOf(TestForm)).call(this, node));
            //console.log(node.unboundModel.data);
        }

        _createClass(TestForm, null, [{
            key: 'fields',
            value: function fields() {
                return Form.field(Table, [Form.field(Button, { get: function get() {
                        return 'flip';
                    }, set: function set($$) {
                        return $$.set('flip', $$('flip') == 'Y' ? 'N' : 'Y');
                    } }), Form.field(Button, { get: function get() {
                        return 'skip';
                    }, set: function set($$) {
                        return $$.set('skip', $$('skip') == 'Y' ? 'N' : 'Y');
                    } }), Form.field(Button, { get: function get() {
                        return 'append';
                    }, set: function set($$) {
                        return $$('policy.cmau.location').pop().append('.car', { vinnumber: 'New' });
                    } }), Form.field(Table, {
                    get: function get($$) {
                        return $$('policy.cmau.location.car');
                    },
                    atr: function atr($$) {
                        var flip = $$('flip') == 'Y' ? -1 : 1;
                        var skip = $$('skip') == 'Y';
                        return {
                            filter: function filter(row) {
                                return !skip || !(row.data.key % 4);
                            },
                            order: function order(row1, row2) {
                                return flip * (row1.data.key - row2.data.key);
                            }
                        };
                    },
                    pos: [{ newRow: true, colSpan: 3 }]
                }, [Form.field(Text, { get: function get($$) {
                        return $$(".key");
                    } }), Form.field(Dropdown, "field-1", {
                    atr: function atr($$) {
                        return _fields.choice('.vehicletype', Object.keys(typeMap).map(function (k) {
                            return {
                                value: k,
                                description: typeMap[k].name
                            };
                        }));
                    }
                }), Form.field(Text, { get: function get($$) {
                        return $$(".vinnumber");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".TrailerType");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".make");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".VehicleClass");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".StatedAmt");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".DumpingOpInd");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".Horsepower");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".vehicleocostnew");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".ModelYr");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".VehUseCd");
                    } }), Form.field(Text, { get: function get($$) {
                        return $$(".vinvalid");
                    } }), Form.field(Button, { get: function get() {
                        return 'Delete';
                    }, set: function set($$) {
                        return $$.detach();
                    } })])]);
            }
        }]);

        return TestForm;
    }(Core.Form);
});