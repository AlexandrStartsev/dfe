'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['dfe-common'], function (cmn) {
    return {
        simple: function simple(field, _val, attrs) {
            var hasVal = Array.isArray(_val);hasVal || (attrs = _val);attrs || (attrs = {});
            return _extends({
                get: function get(model) {
                    return model.get(field);
                },
                set: function set(model, value) {
                    return model.set(field, value);
                },
                val: function val(model) {
                    return hasVal ? !_val.some(function (func) {
                        return func.call(model.$node.form, model, model.get(field).toString(), field, attrs) === false;
                    }) : model.required(field);
                }
            }, attrs);
        },
        date: function date(field, _val2, attrs) {
            var hasVal = Array.isArray(_val2);hasVal || (attrs = _val2);attrs || (attrs = {});
            return _extends({
                format: 'MM/DD/YYYY',
                transform: '67890134',
                get: function get(model) {
                    return model.get(field);
                },
                set: function set(model, value) {
                    return model.set(field, value);
                },
                val: function val(model) {
                    var value = cmn.ARFtoDate(model.get(field));
                    return value instanceof Date ? !(hasVal && _val2.some(function (func) {
                        return func.call(model.$node.form, model, value, field, attrs) === false;
                    })) : model.error(hasVal ? _val2[0] : 'Invalid format');
                }
            }, attrs);
        },
        choice: function choice(field, items, attrs) {
            return _extends({
                get: function get(model) {
                    return { value: model.get(field), items: items };
                },
                set: function set(model, value) {
                    return model.set(field, value);
                },
                val: function val(model) {
                    return model.required(field);
                },
                "default": []
            }, attrs);
        },
        ajaxChoice: function ajaxChoice(field, opts, attrs) {
            return _extends({
                get: function get(model) {
                    return opts.query ? cmn.ajaxFeed(model, cmn.extend(opts, { value: model.get(field) })) : cmn.ajaxFeed(model, { query: opts, value: model.get(field) });
                },
                set: function set(model, value) {
                    return model.set(field, value);
                },
                "default": []
            }, attrs);
        },
        choiceItems: function choiceItems(arg) {
            return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' ? Object.getOwnPropertyNames(arg).map(function (key) {
                return { value: arg[key], description: key };
            }) : [];
        }
    };
});