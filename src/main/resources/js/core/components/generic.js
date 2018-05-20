'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
                var sub = [],
                    wrap = attributes.wrap,
                    rest = _objectWithoutProperties(attributes, ['wrap']),
                    header = children.get(null);
                header && header.forEach(function (child) {
                    return sub.push(Core.createElement('span', child));
                });
                children.forEach(function (map, row) {
                    return row && map.forEach(function (child) {
                        return sub.push(Core.createElement('span', child));
                    });
                });
                return wrap ? Core.createElement('span', attributes, sub) : [sub];
            }
        }]);

        return Span;
    }(BaseComponent);
});

define('components/div', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent3) {
        _inherits(Div, _BaseComponent3);

        function Div() {
            _classCallCheck(this, Div);

            return _possibleConstructorReturn(this, (Div.__proto__ || Object.getPrototypeOf(Div)).apply(this, arguments));
        }

        _createClass(Div, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var sub = [],
                    wrap = attributes.wrap,
                    rest = _objectWithoutProperties(attributes, ['wrap']),
                    header = children.get(null);
                header && header.forEach(function (child) {
                    return sub.push(Core.createElement('div', child));
                });
                children.forEach(function (map, row) {
                    return row && map.forEach(function (child) {
                        return sub.push(Core.createElement('div', child));
                    });
                });
                return wrap ? Core.createElement('div', rest, sub) : [sub];
            }
        }]);

        return Div;
    }(BaseComponent);
});

define('components/inline-rows', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent4) {
        _inherits(InlineRows, _BaseComponent4);

        function InlineRows() {
            _classCallCheck(this, InlineRows);

            return _possibleConstructorReturn(this, (InlineRows.__proto__ || Object.getPrototypeOf(InlineRows)).apply(this, arguments));
        }

        _createClass(InlineRows, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var singleColumn = attributes.singleColumn;

                var rows = [],
                    current = void 0,
                    type = this.$node.elementInfo.type;
                var cellElement = type === 'div' || type === 'span' ? type : 'td';
                children.forEach(function (map, row) {
                    return map.forEach(function (child) {
                        if (child.control instanceof InlineRows) {
                            rows.push(child);
                            current = undefined;
                        } else {
                            var ii = child.field.layout && child.field.layout[0];
                            if (current === undefined || !singleColumn || ii && ii.newRow) {
                                rows.push(current = []);
                            }
                            current.push(Core.createElement(cellElement, child));
                        }
                    });
                });
                return rows;
            }
        }]);

        return InlineRows;
    }(BaseComponent);
});

define('components/table', ['dfe-core', 'components/base', 'components/inline-rows'], function (Core, BaseComponent, InlineRows) {
    return function (_BaseComponent5) {
        _inherits(Table, _BaseComponent5);

        function Table(node) {
            _classCallCheck(this, Table);

            var _this8 = _possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).call(this, node));

            _this8.allColumns = node.field.children;
            _this8.form = node.form;
            return _this8;
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
                    singleColumn = attributes.singleColumn,
                    skip = attributes.skip,
                    colOrder = attributes.colOrder,
                    filter = attributes.filter,
                    order = attributes.order,
                    rest = _objectWithoutProperties(attributes, ['rowclass$header', 'rowstyle$header', 'rowclass$footer', 'rowstyle$footer', 'rowclass', 'rowstyle', 'singleColumn', 'skip', 'colOrder', 'filter', 'order']);

                data = this.orderFilterRows(data, filter, order).map(function (row) {
                    return row.data;
                });
                var columns = this.orderFilterFields(skip, colOrder);
                var head = this.makeRows(columns, [null], children, 'header', { style: headerStyle, class: headerClass }, 'tr', 'th', singleColumn);
                var foot = this.makeRows(columns, [null], children, 'footer', { style: footerStyle, class: footerClass }, 'tr', 'td', singleColumn);
                var body = this.makeRows(columns, data, children, '', { style: rowStyle, class: rowClass }, 'tr', 'td', singleColumn);
                return Core.createElement('table', rest, [head.length && Core.createElement('thead', {}, head), body.length && Core.createElement('tbody', {}, body), foot.length && Core.createElement('tfoot', {}, foot)]);
            }
        }, {
            key: 'makeRows',
            value: function makeRows(orderedFilteredColumns, orderedFilteredRows, children, clazz, rowAttributes, rowElement, cellElement, singleColumn) {
                var rows = [];
                orderedFilteredRows.forEach(function (row) {
                    var map = children.get(row),
                        current = void 0;
                    if (map) {
                        orderedFilteredColumns.forEach(function (field) {
                            if ((field.class || '') === clazz) {
                                var child = map.get(field);
                                if (child) {
                                    if (child.control instanceof InlineRows) {
                                        rows.push(Core.createElement(rowElement, child, function (layout) {
                                            return _extends({}, layout, rowAttributes);
                                        }));
                                        current = undefined;
                                    } else {
                                        var ii = child.field.layout && child.field.layout[0];
                                        if (current === undefined || singleColumn || ii && ii.newRow) {
                                            rows.push(current = Core.createElement(rowElement, _extends({ key: row ? row.key : 0 }, rowAttributes)));
                                        }
                                        current.children.push(Core.createElement(cellElement, child));
                                    }
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
                var _this9 = this;

                var columns = skip ? this.allColumns.filter(function (columns) {
                    return typeof skip === 'function' ? !skip.call(_this9.form, columns.name) : skip.indexOf(columns.name) === -1;
                }) : this.allColumns;
                return typeof colOrder === 'function' ? columns.sort(function (c1, c2) {
                    return colOrder.call(_this9.form, c1.name, c2.name);
                }) : columns;
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
                    singleColumn = attributes.singleColumn,
                    skip = attributes.skip,
                    colOrder = attributes.colOrder,
                    filter = attributes.filter,
                    order = attributes.order,
                    rest = _objectWithoutProperties(attributes, ['rowclass$header', 'rowstyle$header', 'rowclass$footer', 'rowstyle$footer', 'rowclass', 'rowstyle', 'singleColumn', 'skip', 'colOrder', 'filter', 'order']);

                data = this.orderFilterRows(data, filter, order).map(function (row) {
                    return row.data;
                });
                var columns = this.orderFilterFields(skip, colOrder);
                return Core.createElement('div', rest, [].concat(_toConsumableArray(this.makeRows(columns, [null], children, 'header', { style: headerStyle, class: headerClass }, 'div', 'div', singleColumn)), _toConsumableArray(this.makeRows(columns, data, children, '', { style: rowStyle, class: rowClass }, 'div', 'div', singleColumn)), _toConsumableArray(this.makeRows(columns, [null], children, 'footer', { style: footerStyle, class: footerClass }, 'div', 'div', singleColumn))));
            }
        }]);

        return DivR;
    }(Table);
});

define('components/validation-component', ['dfe-core', 'core-validation-component'], function (Core, CoreValidationComponent) {
    return function (_CoreValidationCompon) {
        _inherits(ValidationComponent, _CoreValidationCompon);

        function ValidationComponent() {
            _classCallCheck(this, ValidationComponent);

            return _possibleConstructorReturn(this, (ValidationComponent.__proto__ || Object.getPrototypeOf(ValidationComponent)).apply(this, arguments));
        }

        _createClass(ValidationComponent, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                return !!error && !attributes.hideError && Core.createElement('label', { class: 'dfe-error', text: error.toString() });
            }
        }, {
            key: 'splitAttributes',
            value: function splitAttributes(attributes, error) {
                var ret = {},
                    hideError = attributes.hideError;
                if (!!error && !hideError && attributes.errorClass) {
                    ret.class = (attributes.class ? attributes.class + ' ' : '') + attributes.errorClass;
                    hideError = true;
                    delete attributes.class;
                }
                delete attributes.errorClass;
                delete attributes.hideError;
                Object.getOwnPropertyNames(attributes).forEach(function (a) {
                    ret[a] = attributes[a];
                    delete attributes[a];
                });
                if (hideError) {
                    attributes.hideError = true;
                }
                return ret;
            }
        }]);

        return ValidationComponent;
    }(CoreValidationComponent);
});

define('components/label', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    return function (_ValidationComponent) {
        _inherits(Label, _ValidationComponent);

        function Label() {
            _classCallCheck(this, Label);

            return _possibleConstructorReturn(this, (Label.__proto__ || Object.getPrototypeOf(Label)).apply(this, arguments));
        }

        _createClass(Label, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var html = attributes.html,
                    text = attributes.text,
                    label = attributes.label,
                    hideError = attributes.hideError,
                    rest = _objectWithoutProperties(attributes, ['html', 'text', 'label', 'hideError']);

                return [[html || label ? Core.createElement('label', _extends({ text: label, html: html }, rest)) : text || data.toString(), _get(Label.prototype.__proto__ || Object.getPrototypeOf(Label.prototype), 'render', this).call(this, null, error, { hideError: hideError }, children)]];
            }
        }]);

        return Label;
    }(ValidationComponent);
});

define('components/editbox', ['dfe-core', 'components/validation-component', 'ui/date-picker-polyfill'], function (Core, ValidationComponent) {
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
    return function (_ValidationComponent2) {
        _inherits(Editbox, _ValidationComponent2);

        function Editbox(node) {
            _classCallCheck(this, Editbox);

            var _this13 = _possibleConstructorReturn(this, (Editbox.__proto__ || Object.getPrototypeOf(Editbox)).call(this, node));

            _this13.ca = 0;
            _this13.events = {
                onKeyDown: function onKeyDown(e) {
                    return _this13.onKeyDown(e);
                },
                onKeyUp: function onKeyUp(e) {
                    return _this13.onKeyUp(e);
                },
                onChange: function onChange(e) {
                    return _this13.onKeyUp(e, true);
                }
            };
            return _this13;
        }

        _createClass(Editbox, [{
            key: 'onKeyUp',
            value: function onKeyUp(e, doStore) {
                doStore = doStore || this.trigger !== 'change';
                var data = Patterning(Formatting(e.target.value, this.format), this.pattern);
                var transform = typeof this.transform === 'string' && this.transform.split('').map(function (s) {
                    return +s;
                });
                if (transform) {
                    var t = [];
                    for (var i = 0; i < transform.length; i++) {
                        data.length > transform[i] && (t[i] = data.charAt(transform[i]));
                    }for (var _i = 0; _i < t.length; _i++) {
                        t[_i] = t[_i] || ' ';
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
                    var m = void 0,
                        _v = void 0;
                    m = (_v = ui.value.substr(0, s) + e.key + ui.value.substr(ui.selectionEnd)).match(this.pattern);
                    (!m || m[0] != _v) && (this.ca--, e.preventDefault());
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
                var format = attributes.format,
                    pattern = attributes.pattern,
                    transform = attributes.transform,
                    trigger = attributes.trigger,
                    rest = _objectWithoutProperties(attributes, ['format', 'pattern', 'transform', 'trigger']);

                _extends(this, { format: format, pattern: pattern, transform: transform, trigger: trigger });
                return [[Core.createElement('input', _extends({}, this.splitAttributes(rest, error), this.events, { value: this.getValueProcessed(data.toString()) })), typeof errorClass !== 'string' && _get(Editbox.prototype.__proto__ || Object.getPrototypeOf(Editbox.prototype), 'render', this).call(this, null, error, rest)]];
            }
        }]);

        return Editbox;
    }(ValidationComponent);
});

define('components/editbox-money', ['components/editbox'], function (Editbox) {
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
            value: function onKeyUp(e, doStore) {
                doStore = doStore || this.trigger !== 'change';
                var ui = e.target,
                    data = this.getValueProcessed(ui.value, ui);
                doStore && this.store(data.replace(/[$,]/g, ''));
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
    return function (_ValidationComponent3) {
        _inherits(Button, _ValidationComponent3);

        function Button() {
            _classCallCheck(this, Button);

            return _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).apply(this, arguments));
        }

        _createClass(Button, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this16 = this;

                var value = data.toString(),
                    type = attributes.type,
                    rest = _objectWithoutProperties(attributes, ['type']);
                return [[Core.createElement('input', _extends({}, this.splitAttributes(rest, error), { value: value, type: type || 'button', onClick: function onClick() {
                        return _this16.store(value, 'click');
                    } })), _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'render', this).call(this, null, error, rest)]];
            }
        }]);

        return Button;
    }(ValidationComponent);
});

define('components/checkbox', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    return function (_ValidationComponent4) {
        _inherits(Checkbox, _ValidationComponent4);

        function Checkbox() {
            _classCallCheck(this, Checkbox);

            return _possibleConstructorReturn(this, (Checkbox.__proto__ || Object.getPrototypeOf(Checkbox)).apply(this, arguments));
        }

        _createClass(Checkbox, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this18 = this;

                if (Array.isArray(data)) {
                    data = data[0];
                }

                var rest = _objectWithoutProperties(attributes, []);

                var checked = data && ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' ? data.checked && data.checked.toString().match(/Y|y/) : data.toString().match(/Y|y/));
                var text = (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && data.text;
                return [[Core.createElement('input', _extends({}, this.splitAttributes(rest, error), { checked: !!checked, type: 'checkbox', onChange: function onChange(e) {
                        return _this18.store(e.target.checked ? 'Y' : 'N');
                    } })), text, _get(Checkbox.prototype.__proto__ || Object.getPrototypeOf(Checkbox.prototype), 'render', this).call(this, null, error, rest)]];
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
    return function (_ValidationComponent5) {
        _inherits(Dropdown, _ValidationComponent5);

        function Dropdown() {
            _classCallCheck(this, Dropdown);

            return _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).apply(this, arguments));
        }

        _createClass(Dropdown, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this20 = this;

                var def = attributes['default'],
                    rest = _objectWithoutProperties(attributes, ['default']);

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
                return [[Core.createElement('select', _extends({}, this.splitAttributes(rest, error), { selectedIndex: selectedIndex, onChange: function onChange(e) {
                        return _this20.store(options[e.target.selectedIndex].value);
                    } }), options.map(function (opt) {
                    return Core.createElement('option', { value: opt.value, text: opt.text });
                })), _get(Dropdown.prototype.__proto__ || Object.getPrototypeOf(Dropdown.prototype), 'render', this).call(this, null, error, rest)]];
            }
        }]);

        return Dropdown;
    }(ValidationComponent);
});

define('components/html', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent6) {
        _inherits(Html, _BaseComponent6);

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

define('components/html-form', ['dfe-core', 'components/div'], function (Core, Div) {
    return function (_Div) {
        _inherits(HtmlForm, _Div);

        function HtmlForm() {
            _classCallCheck(this, HtmlForm);

            return _possibleConstructorReturn(this, (HtmlForm.__proto__ || Object.getPrototypeOf(HtmlForm)).apply(this, arguments));
        }

        _createClass(HtmlForm, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var name = attributes.name,
                    id = attributes.id,
                    action = attributes.action,
                    method = attributes.method,
                    target = attributes.target,
                    rest = _objectWithoutProperties(attributes, ['name', 'id', 'action', 'method', 'target']);

                return Core.createElement('form', { name: name, id: id, action: action, method: method, target: target }, [_get(HtmlForm.prototype.__proto__ || Object.getPrototypeOf(HtmlForm.prototype), 'render', this).call(this, data, error, _extends({}, rest, { wrap: true }), children)]);
            }
        }]);

        return HtmlForm;
    }(Div);
});

define('components/tab-s', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent7) {
        _inherits(TabS, _BaseComponent7);

        function TabS(node) {
            _classCallCheck(this, TabS);

            var _this23 = _possibleConstructorReturn(this, (TabS.__proto__ || Object.getPrototypeOf(TabS)).call(this, node));

            _this23.activeTab = -1;
            _this23.lastRows = new Set();
            return _this23;
        }

        _createClass(TabS, [{
            key: 'setActiveTab',
            value: function setActiveTab(key) {
                if (this.activeTab !== key) {
                    this.activeTab = key;
                    this.update();
                }
            }
        }, {
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this24 = this;

                var headerClass = attributes.rowclass$header,
                    headerStyle = attributes.rowstyle$header,
                    rowClass = attributes.rowclass,
                    rowStyle = attributes.rowstyle,
                    headField = attributes.headField,
                    focusnew = attributes.focusnew,
                    haclass = attributes.haclass,
                    rest = _objectWithoutProperties(attributes, ['rowclass$header', 'rowstyle$header', 'rowclass', 'rowstyle', 'headField', 'focusnew', 'haclass']),
                    nextRows = new Set();

                var head = Core.createElement('div', { class: headerClass, style: headerStyle });
                var body = []; //Core.createElement('div', { class: rowClass, style : rowStyle });
                this.activeTab = data.some(function (proxy) {
                    return _this24.activeTab === proxy.data.key;
                }) ? this.activeTab : data[0] && data[0].data.key;
                data.forEach(function (proxy) {
                    var key = proxy.data.key;
                    nextRows.add(key);
                    _this24.lastRows.has(key) || _this24.lastRows.size && focusnew && (_this24.activeTab = key);
                });
                headField = headField || 'header';
                this.lastRows = nextRows;
                children.forEach(function (map, row) {
                    if (row) {
                        map.forEach(function (child, field) {
                            if (field.name === headField) {
                                head.children.push(Core.createElement('div', child, function (layout) {
                                    return _extends({}, layout, row.key === _this24.activeTab ? { class: (layout.class ? layout.class + ' ' : '') + haclass } : {}, {
                                        onClick: function onClick() {
                                            return _this24.setActiveTab(row.key);
                                        }
                                    });
                                }));
                            } else {
                                row.key === _this24.activeTab && body.push(Core.createElement('div', child)); //body.children.push( Core.createElement('div', child) );
                                //body.push( Core.createElement('div', child, layout => row.key === this.activeTab ? layout : ({...layout, style: 'display: none'}) ) );
                            }
                        });
                    }
                });
                return Core.createElement('div', rest, [head].concat(body));
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

    return function (_BaseComponent8) {
        _inherits(TabD, _BaseComponent8);

        function TabD(node) {
            _classCallCheck(this, TabD);

            var _this25 = _possibleConstructorReturn(this, (TabD.__proto__ || Object.getPrototypeOf(TabD)).call(this, node));

            _this25.handler = new ActiveTabHandler(_this25);
            _this25.allColumns = node.field.children;
            return _this25;
        }

        _createClass(TabD, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this26 = this;

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
                var headField = this.allColumns.filter(function (field) {
                    return !field.class;
                }).pop();
                data.forEach(function (model) {
                    var child = children.get(model.data).get(headField),
                        isActive = (useHandler ? _this26.handler.activeTab : activeTab)(model);
                    if (child) {
                        head.children.push(Core.createElement('div', child, function (layout) {
                            return _extends({}, layout, isActive ? { class: (layout.class ? layout.class + ' ' : '') + haclass } : {}, {
                                onClick: function onClick() {
                                    return _this26.handler.store(model), _this26.store(model);
                                }
                            });
                        }));
                    }
                });
                children.get(null).forEach(function (child, field) {
                    return field.name === (useHandler ? _this26.handler.activeTab : activeTab)() && body.children.push(Core.createElement('div', child));
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
                var _this28 = this;

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
                    return _this28.toColumns(children.get(model.data), fields[""], columns);
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
    return function (_ValidationComponent6) {
        _inherits(Radiolist, _ValidationComponent6);

        function Radiolist(node) {
            _classCallCheck(this, Radiolist);

            var _this29 = _possibleConstructorReturn(this, (Radiolist.__proto__ || Object.getPrototypeOf(Radiolist)).call(this, node));

            _this29.defaultName = 'Radiolist#' + ++radioNameCounter;
            return _this29;
        }

        _createClass(Radiolist, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this30 = this;

                var orientation = attributes.orientation,
                    rest = _objectWithoutProperties(attributes, ['orientation']);

                var normalized = (Array.isArray(data) ? data[0] : data) || 'N';
                if (typeof normalized === 'string') {
                    normalized = { value: data, items: [{ value: 'Y', description: 'Yes' }, { value: 'N', description: 'No' }] };
                }
                return [[].concat(_toConsumableArray(Array.prototype.concat.apply([], normalized.items.map(function (item) {
                    return [Core.createElement('input', _extends({
                        name: _this30.defaultName
                    }, _this30.splitAttributes(rest, error), {
                        type: 'radio',
                        checked: testChoice(normalized.value, item.value),
                        onChange: function onChange() {
                            return _this30.store(item.value);
                        }
                    })), item.description || item.value.toString(), orientation === 'vertical' && Core.createElement('br')];
                }))), [_get(Radiolist.prototype.__proto__ || Object.getPrototypeOf(Radiolist.prototype), 'render', this).call(this, null, error, rest)])];
            }
        }]);

        return Radiolist;
    }(ValidationComponent);
});

define('components/iframe', ['dfe-core', 'components/base'], function (Core, BaseComponent) {
    return function (_BaseComponent9) {
        _inherits(Iframe, _BaseComponent9);

        function Iframe() {
            _classCallCheck(this, Iframe);

            return _possibleConstructorReturn(this, (Iframe.__proto__ || Object.getPrototypeOf(Iframe)).apply(this, arguments));
        }

        _createClass(Iframe, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                return Core.createElement('iframe', _extends({ src: data.toString() }, attributes));
            }
        }]);

        return Iframe;
    }(BaseComponent);
});

define('components/textarea', ['dfe-core', 'components/editbox', 'components/validation-component'], function (Core, Editbox, ValidationComponent) {
    return function (_Editbox2) {
        _inherits(Textarea, _Editbox2);

        function Textarea() {
            _classCallCheck(this, Textarea);

            return _possibleConstructorReturn(this, (Textarea.__proto__ || Object.getPrototypeOf(Textarea)).apply(this, arguments));
        }

        _createClass(Textarea, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var format = attributes.format,
                    pattern = attributes.pattern,
                    transform = attributes.transform,
                    trigger = attributes.trigger,
                    rest = _objectWithoutProperties(attributes, ['format', 'pattern', 'transform', 'trigger']);

                _extends(this, { format: format, pattern: pattern, transform: transform, trigger: trigger });
                return [[Core.createElement('textarea', _extends({}, this.splitAttributes(rest, error), this.events, { value: this.getValueProcessed(data.toString()) })), ValidationComponent.prototype.render.call(this, null, error, rest)]];
            }
        }]);

        return Textarea;
    }(Editbox);
});

define('components/child-runtime', ['dfe-core'], function (Core) {
    return function (_Core$Component4) {
        _inherits(ChildRuntime, _Core$Component4);

        function ChildRuntime() {
            _classCallCheck(this, ChildRuntime);

            return _possibleConstructorReturn(this, (ChildRuntime.__proto__ || Object.getPrototypeOf(ChildRuntime)).apply(this, arguments));
        }

        _createClass(ChildRuntime, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this34 = this;

                var formName = attributes.form,
                    editTarget = attributes.editTarget,
                    _ref = attributes.ref,
                    rest = _objectWithoutProperties(attributes, ['form', 'editTarget', 'ref']);

                var model = data[0] || {};
                ChildRuntime.setDOMAttributes(this.ref, formName, editTarget, model);
                return Core.createElement('div', _extends({}, rest, {
                    ref: function ref(dom) {
                        return _ref && _ref(dom), ChildRuntime.setDOMAttributes(_this34.ref = dom, formName, editTarget, model);
                    }
                }));
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                var rt = this.ref && this.ref._dfe_runtime;
                if (rt) {
                    rt.shutdown();
                }
                _get(ChildRuntime.prototype.__proto__ || Object.getPrototypeOf(ChildRuntime.prototype), 'destroy', this).call(this);
            }
        }], [{
            key: 'setDOMAttributes',
            value: function setDOMAttributes(ref, formName, editTarget, model) {
                if (ref) {
                    ref.setAttribute('dfe-form', formName);
                    ref.dfeModel = model;
                    editTarget ? ref.setAttribute('dfe-edit-target', '') : element.removeAttribute('dfe-edit-target');
                }
            }
        }]);

        return ChildRuntime;
    }(Core.Component);
});

define('components/div-button', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    return function (_ValidationComponent7) {
        _inherits(DivButton, _ValidationComponent7);

        function DivButton() {
            _classCallCheck(this, DivButton);

            return _possibleConstructorReturn(this, (DivButton.__proto__ || Object.getPrototypeOf(DivButton)).apply(this, arguments));
        }

        _createClass(DivButton, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this36 = this;

                var value = data.toString(),
                    rest = _objectWithoutProperties(attributes, []);
                return Core.createElement('div', _extends({}, this.splitAttributes(rest, error), { onClick: function onClick() {
                        return _this36.store(value, 'click');
                    } }), [Core.createElement('label', { class: 'div-button-text', html: value }), _get(DivButton.prototype.__proto__ || Object.getPrototypeOf(DivButton.prototype), 'render', this).call(this, null, error, rest)]);
            }
        }]);

        return DivButton;
    }(ValidationComponent);
});

define('components/multioption', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    return function (_ValidationComponent8) {
        _inherits(Multioption, _ValidationComponent8);

        function Multioption() {
            _classCallCheck(this, Multioption);

            return _possibleConstructorReturn(this, (Multioption.__proto__ || Object.getPrototypeOf(Multioption)).apply(this, arguments));
        }

        _createClass(Multioption, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var _this38 = this;

                var value = data.value.toString(),
                    rest = _objectWithoutProperties(attributes, []);
                return Core.createElement('div', _extends({}, this.splitAttributes(rest, error)), [].concat(_toConsumableArray(Array.prototype.concat.apply([], data.options.map(function (option) {
                    return [Core.createElement('input', {
                        type: 'checkbox',
                        checked: option === value,
                        onChange: function onChange(e) {
                            return _this38.store(e.target.checked ? option : []);
                        }
                    }), option];
                }))), [_get(Multioption.prototype.__proto__ || Object.getPrototypeOf(Multioption.prototype), 'render', this).call(this, null, error, rest)]));
            }
        }]);

        return Multioption;
    }(ValidationComponent);
});

define('components/labeled-component', ['dfe-core', 'components/label'], function (Core, Label) {
    return function (_Label) {
        _inherits(LabeledComponent, _Label);

        function LabeledComponent() {
            _classCallCheck(this, LabeledComponent);

            return _possibleConstructorReturn(this, (LabeledComponent.__proto__ || Object.getPrototypeOf(LabeledComponent)).apply(this, arguments));
        }

        _createClass(LabeledComponent, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var firstChild = void 0;
                children.forEach(function (map) {
                    return map.forEach(function (child) {
                        return firstChild || (firstChild = child);
                    });
                });
                return [].concat(_toConsumableArray(_get(LabeledComponent.prototype.__proto__ || Object.getPrototypeOf(LabeledComponent.prototype), 'render', this).call(this, "not specified", error, attributes, children)), [firstChild]);
            }
        }]);

        return LabeledComponent;
    }(Label);
});

define('components/labeled', ['dfe-core', 'components/validation-component'], function (Core, ValidationComponent) {
    return function (_ValidationComponent9) {
        _inherits(Labeled, _ValidationComponent9);

        function Labeled(node) {
            _classCallCheck(this, Labeled);

            var _this40 = _possibleConstructorReturn(this, (Labeled.__proto__ || Object.getPrototypeOf(Labeled)).call(this, node));

            _this40.renderComponent = _this40.getComponent().prototype.render.bind(new (_this40.getComponent())(node));
            return _this40;
        }

        _createClass(Labeled, [{
            key: 'render',
            value: function render(data, error, attributes, children) {
                var cclass = attributes.cclass,
                    cstyle = attributes.cstyle,
                    text = attributes.text,
                    label = attributes.label,
                    html = attributes.html,
                    hideError = attributes.hideError,
                    rest = _objectWithoutProperties(attributes, ['cclass', 'cstyle', 'text', 'label', 'html', 'hideError']);

                return [[html || label || cclass || cstyle ? Core.createElement('label', { class: cclass, style: cstyle, text: label || text, html: html }) : text, _get(Labeled.prototype.__proto__ || Object.getPrototypeOf(Labeled.prototype), 'render', this).call(this, null, error, { hideError: hideError })]].concat(_toConsumableArray(this.renderComponent(data, null, rest, children)));
            }
        }]);

        return Labeled;
    }(ValidationComponent);
});

define('components/labeled-checkbox', ['dfe-core', 'components/checkbox', 'components/labeled'], function (Core, Checkbox, Labeled) {
    return function (_Labeled) {
        _inherits(LabeledCheckbox, _Labeled);

        function LabeledCheckbox() {
            _classCallCheck(this, LabeledCheckbox);

            return _possibleConstructorReturn(this, (LabeledCheckbox.__proto__ || Object.getPrototypeOf(LabeledCheckbox)).apply(this, arguments));
        }

        _createClass(LabeledCheckbox, [{
            key: 'getComponent',
            value: function getComponent() {
                return Checkbox;
            }
        }]);

        return LabeledCheckbox;
    }(Labeled);
});

define('components/labeled-editbox', ['dfe-core', 'components/editbox', 'components/labeled'], function (Core, Editbox, Labeled) {
    return function (_Labeled2) {
        _inherits(LabeledEditbox, _Labeled2);

        function LabeledEditbox() {
            _classCallCheck(this, LabeledEditbox);

            return _possibleConstructorReturn(this, (LabeledEditbox.__proto__ || Object.getPrototypeOf(LabeledEditbox)).apply(this, arguments));
        }

        _createClass(LabeledEditbox, [{
            key: 'getComponent',
            value: function getComponent() {
                return Editbox;
            }
        }]);

        return LabeledEditbox;
    }(Labeled);
});

define('components/labeled-dropdown', ['dfe-core', 'components/dropdown', 'components/labeled'], function (Core, Dropdown, Labeled) {
    return function (_Labeled3) {
        _inherits(LabeledDropdown, _Labeled3);

        function LabeledDropdown() {
            _classCallCheck(this, LabeledDropdown);

            return _possibleConstructorReturn(this, (LabeledDropdown.__proto__ || Object.getPrototypeOf(LabeledDropdown)).apply(this, arguments));
        }

        _createClass(LabeledDropdown, [{
            key: 'getComponent',
            value: function getComponent() {
                return Dropdown;
            }
        }]);

        return LabeledDropdown;
    }(Labeled);
});

define('components/labeled-editbox-money', ['dfe-core', 'components/editbox-money', 'components/labeled'], function (Core, EditboxMoney, Labeled) {
    return function (_Labeled4) {
        _inherits(LabeledEditboxMoney, _Labeled4);

        function LabeledEditboxMoney() {
            _classCallCheck(this, LabeledEditboxMoney);

            return _possibleConstructorReturn(this, (LabeledEditboxMoney.__proto__ || Object.getPrototypeOf(LabeledEditboxMoney)).apply(this, arguments));
        }

        _createClass(LabeledEditboxMoney, [{
            key: 'getComponent',
            value: function getComponent() {
                return EditboxMoney;
            }
        }]);

        return LabeledEditboxMoney;
    }(Labeled);
});

define('components/labeled-radiolist', ['dfe-core', 'components/radiolist', 'components/labeled'], function (Core, Radiolist, Labeled) {
    return function (_Labeled5) {
        _inherits(LabeledRadiolist, _Labeled5);

        function LabeledRadiolist() {
            _classCallCheck(this, LabeledRadiolist);

            return _possibleConstructorReturn(this, (LabeledRadiolist.__proto__ || Object.getPrototypeOf(LabeledRadiolist)).apply(this, arguments));
        }

        _createClass(LabeledRadiolist, [{
            key: 'getComponent',
            value: function getComponent() {
                return Radiolist;
            }
        }]);

        return LabeledRadiolist;
    }(Labeled);
});

define('components/modal', ['dfe-core', 'components/div'], function (Core, Div) {
    return function (_Core$Form) {
        _inherits(Modal, _Core$Form);

        function Modal(node) {
            _classCallCheck(this, Modal);

            var _this46 = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, node));

            _this46.root = null;
            return _this46;
        }

        _createClass(Modal, [{
            key: 'render',
            value: function render(data, error, attribures, children) {
                var root = null;
                children.forEach(function (map) {
                    return map.forEach(function (child) {
                        return root || (root = child);
                    });
                });
                if (this.root !== root) {
                    this.root && this.root.setDom(null, null, null);
                    if (root !== null) {
                        root.setDom({ type: 'div', attributeMapper: function attributeMapper(layout) {
                                return _extends({}, layout, attribures);
                            } }, document.body, null);
                    }
                    this.root = root;
                }
                return [];
            }
        }], [{
            key: 'fields',
            value: function fields(children, config) {
                return Core.Form.field(Div, {
                    atr: function atr() {
                        return { wrap: false };
                    },
                    layout: [{ style: 'position: absolute; left: 300px; top: 300px; border: 2px solid #bbb; border-radius: 3px; padding: 5px;' }]
                }, children);
            }
        }]);

        return Modal;
    }(Core.Form);
});

define('components/editbox-popup', ['dfe-core', 'components/editbox', 'components/textarea'], function (Core, Editbox, Textarea) {
    return function (_Editbox3) {
        _inherits(EditboxPopup, _Editbox3);

        function EditboxPopup(node) {
            _classCallCheck(this, EditboxPopup);

            var _this47 = _possibleConstructorReturn(this, (EditboxPopup.__proto__ || Object.getPrototypeOf(EditboxPopup)).call(this, node));

            var editBoxKeyDownEvent = _this47.events.onKeyDown;
            _this47.popup = Core.createNode(node, { component: Textarea, set: function set(_, value) {
                    return _this47.store(_this47.setMapper(value));
                } }, node.unboundModel, node.runtime);
            _this47.ref = null;
            _this47.focusInterval = null;
            _this47.popupAttributes = {};
            _this47.scrollFollow = function () {
                return _this47.renderPopup();
            };
            _this47.memorizedDims = '';
            _this47.events = _extends({}, _this47.events, {
                onKeyDown: function onKeyDown(e) {
                    return _this47.popupEvent(e), editBoxKeyDownEvent(e);
                },
                onFocus: function onFocus() {
                    return _this47.renderPopup(true);
                }
            });
            return _this47;
        }

        _createClass(EditboxPopup, [{
            key: 'render',
            value: function render(value, error, attributes, children) {
                var _this48 = this;

                var popupAttributes = attributes.ta,
                    _ref2 = attributes.ref,
                    rest = _objectWithoutProperties(attributes, ['ta', 'ref']);

                this.popupAttributes = popupAttributes;
                this.popupData = this.getMapper(value);
                this.popupError = error;
                this.renderPopup();
                return _get(EditboxPopup.prototype.__proto__ || Object.getPrototypeOf(EditboxPopup.prototype), 'render', this).call(this, value, error, _extends({ ref: function ref(dom) {
                        return _this48.ref = dom, _ref2 && _ref2(dom);
                    } }, rest), children);
            }
        }, {
            key: 'renderPopup',
            value: function renderPopup(show) {
                var _this49 = this;

                var popup = this.popup,
                    active = this.popupContainer && this.popupContainer.parentNode;
                if (active || show) {
                    popup.shouldRender = true;
                    popup.setDom({ type: 'div' }, this.ref.ownerDocument.body, null);
                    popup.render(this.popupData, this.popupError, this.mapPopupAttributes());
                    if (!active) {
                        for (var _element = this.ref.parentElement; _element; _element = _element.parentElement) {
                            _element.addEventListener('scroll', this.scrollFollow);
                        }
                        this.focusInterval = setInterval(function () {
                            _this49.ref.ownerDocument.activeElement !== _this49.ref && !_this49.resizeOngoing && !_this49.popupContainer.contains(_this49.ref.ownerDocument.activeElement) && _this49.hidePopup();
                        }, 30);
                    }
                }
            }
        }, {
            key: 'hidePopup',
            value: function hidePopup() {
                clearInterval(this.focusInterval);
                this.popup.setDom({ type: 'div' }, null, null);
                for (var _element2 = this.ref.parentElement; _element2; _element2 = _element2.parentElement) {
                    _element2.removeEventListener('scroll', this.scrollFollow);
                }
            }
        }, {
            key: 'popupEvent',
            value: function popupEvent(e) {
                if (e.key === 'Esc' || e.key === 'Escape') {
                    this.hidePopup();
                }
                if (e.key === 'Enter') {
                    this.renderPopup(true);
                }
                if (e.key === 'Tab' && this.popupContainer && this.popupContainer.parentNode) {
                    (e.target === this.ref ? this.getPopupActiveElement() : this.ref).focus();
                    e.preventDefault();
                }
            }
        }, {
            key: 'mapPopupAttributes',
            value: function mapPopupAttributes() {
                var _this50 = this;

                var _popupAttributes = this.popupAttributes,
                    offsetTop = _popupAttributes.offsetTop,
                    offsetLeft = _popupAttributes.offsetLeft,
                    style = _popupAttributes.style,
                    editorClass = _popupAttributes.editorClass,
                    rest = _objectWithoutProperties(_popupAttributes, ['offsetTop', 'offsetLeft', 'style', 'editorClass']);

                var r = this.ref.getBoundingClientRect(),
                    op = this.ref.offsetParent,
                    wnd = this.ref.ownerDocument.defaultView || window;
                var display = op.scrollTop > this.ref.offsetTop + this.ref.offsetHeight || op.scrollTop + op.clientHeight < this.ref.offsetTop + this.ref.offsetHeight ? 'none' : '';
                var top = r.bottom + 2 + (wnd.scrollY || wnd.pageYOffset) + (offsetTop || 0) + 'px';
                var left = r.left + (wnd.scrollX || wnd.pageXOffset) + (offsetLeft || 0) + 'px';
                return {
                    class: editorClass,
                    events: { onKeyDown: function onKeyDown(e) {
                            return _this50.popupEvent(e);
                        } },
                    ref: function ref(dom) {
                        return _this50.setupPopup(dom.parentNode);
                    },
                    attributeMapper: function attributeMapper() {
                        return _extends({}, rest, { style: (style ? style + ';' : '') + 'display:' + display + ';top:' + top + ';left:' + left + ';' + _this50.memorizedDims });
                    }
                };
            }
        }, {
            key: 'setupPopup',
            value: function setupPopup(div) {
                var _this51 = this;

                this.popupContainer = div;
                var document = this.ref.ownerDocument,
                    window = document.defaultView || window;
                var rect = div.getBoundingClientRect();
                var width = rect.right - rect.left;
                var height = rect.bottom - rect.top;
                var handle = document.createElement('span');
                div.appendChild(handle);
                handle.setAttribute('class', 'ui-resizeable-handle-br');
                handle.addEventListener('mousedown', function (e) {
                    _this51.resizeOngoing = true;
                    var ox = e.screenX,
                        oy = e.screenY,
                        move = void 0,
                        _up = void 0;
                    document.addEventListener('mousemove', move = function move(e) {
                        div.style.width = width + e.screenX - ox + 'px';
                        div.style.height = height + e.screenY - oy + 'px';
                        e.preventDefault(), window.getSelection().removeAllRanges();
                        _this51.onResize();
                    });
                    document.addEventListener('mouseup', _up = function up() {
                        _this51.resizeOngoing = false;
                        div.querySelector("textarea, input").focus();
                        document.removeEventListener('mousemove', move);
                        document.removeEventListener('mouseup', _up);
                        rect = div.getBoundingClientRect(), width = rect.right - rect.left, height = rect.bottom - rect.top;
                        _this51.memorizedDims = 'width:' + width + 'px;height:' + height + 'px';
                    });
                });
            }
        }, {
            key: 'onResize',
            value: function onResize() {}
        }, {
            key: 'getMapper',
            value: function getMapper(value) {
                return value;
            }
        }, {
            key: 'setMapper',
            value: function setMapper(value) {
                return value;
            }
        }, {
            key: 'getPopupActiveElement',
            value: function getPopupActiveElement() {
                return this.popupContainer.firstChild;
            }
        }]);

        return EditboxPopup;
    }(Editbox);
});

define("components/generic", ['module', 'components/base', 'components/button', 'components/checkbox', 'components/child-runtime', 'components/container', 'components/div', 'components/div-button', 'components/div-c', 'components/div-r', 'components/dropdown', 'components/editbox', 'components/editbox-money', 'components/editbox-popup', 'components/either', 'components/html', 'components/html-form', 'components/iframe', 'components/inline-rows', 'components/label', 'components/labeled', 'components/labeled-checkbox', 'components/labeled-component', 'components/labeled-dropdown', 'components/labeled-editbox', 'components/labeled-editbox-money', 'components/labeled-radiolist', 'components/modal', 'components/multioption', 'components/radiolist', 'components/span', 'components/tab-d', 'components/table', 'components/tab-s', 'components/text', 'components/textarea', 'components/validation-component'], function (module) {
    for (var _len = arguments.length, components = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        components[_key - 1] = arguments[_key];
    }

    return components.reduce(function (out, clazz) {
        return _extends({}, out, _defineProperty({}, clazz.name, clazz));
    }, {});
});