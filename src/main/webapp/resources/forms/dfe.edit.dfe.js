defineForm([ "require", "uglify", "babel", "dfe-common", "components/button", "components/label", "components/dropdown", "components/checkbox", "components/editbox-code", "components/editbox", "components/div-button", "components/div", "components/div-c", "components/div-r" ], function(require, uglify, babel, cmn, __c_button, __c_label, __c_dropdown, __c_checkbox, __c_editbox_code, __c_editbox, __c_div_button, __c_div, __c_div_c, __c_div_r) {
    return new class {
        constructor() {
            this.dfe = __c_div_r("root", {
                get: $$ => [ $$ ],
                atr: () => ({
                    class: 'div-flex',
                    rowclass: 'div-flex-row',
                    rowstyle: 'border: 1px solid; border-color: darkgray; border-radius: 5px; width: min-content; width: -moz-min-content;',
                    rowstyle$header: 'display: table',
                    rowclass$footer: 'div-flex-row',
                    rowstyle$footer: 'flex-wrap: wrap; width: 800px;'
                })
            }, [ __c_button("add_dfe", {
                class: "header",
                get: () => '+',
                set: function($$, value) {
                    var co = $$('childrenOf'), ppx = this.allFields($$).filter(function(px) {
                        return co == 0 || px.get('.name') == co;
                    }).shift();
                    var d = ppx.append('.children', {
                        name: this.generateName($$),
                        get: this.textToCode($$.runtime, '$$ => [$$]'),
                        children: [],
                        pos: [ {} ]
                    })[0].data;
                    d.component = require('components/editbox');
                    d.form = $$.runtime.target_runtime.form;
                },
                pos: [ {
                    colstyle: "display: inline; height: min-content;"
                } ]
            }), __c_label("l1", {
                class: "header",
                get: () => 'Show only children of: ',
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; "
                } ]
            }), __c_dropdown("childrenOf", {
                class: "header",
                get: $$ => ({ value: $$('childrenOf'),
                        items: [ {
                            value: [],
                            description: 'All'
                        } ].concat(this.allFields($$).filter(function(px) {
                            return px.get('.children') != 0;
                        }).map(function(px) {
                            return px.get('.name');
                        }).sort().map(function(s) {
                            return {
                                value: s
                            };
                        }))
                    }),
                set: ($$, value) => $$.set({ hierarchyOf: [], childrenOf: value}),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; "
                } ]
            }), __c_checkbox("subChildren", {
                class: "header",
                get: $$ => ({
                        checked: $$('subChildren'),
                        text: ''
                    }),
                set: ($$, value) => $$.set('subChildren', value),
                atr: () => ({ style: 'display: inline' }),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; "
                } ]
            }), __c_label("l2", {
                class: "header",
                get: () => 'Show hierarchy: ',
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; "
                } ]
            }), __c_dropdown("hierarchyOf", {
                class: "header",
                get: $$ => ({
                        value: $$('hierarchyOf'),
                        items: [ {
                            value: [],
                            description: 'All'
                        } ].concat(this.allFields($$).map(function(px) {
                            return px.get('.name');
                        }).sort().map(function(s) {
                            return {
                                value: s
                            };
                        }))
                    }),
                set: ($$, value) => $$.set({ childrenOf: [], hierarchyOf: value }),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; "
                } ]
            }), __c_button("JS", {
                class: "header",
                get: () => 'to JS',
                set: $$ => $$.set('pp_output', this.runtimeToJs($$.data)),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), __c_button("JS - min", {
                class: "header",
                get: () => 'to JS(min)',
                set: function($$, value) {
                    var s = babel.transform(this.runtimeToJs($$.data), {
                        plugins: [ 'transform-es3-property-literals', 'transform-es3-member-expression-literals' ],
                        presets: [ 'es2015' ]
                    }).code;
                    //s = s.replace('defineForm("' + $$.data.name + '"', 'defineForm("' + $$.data.name + '.min"');
                                        s = s.replace("Object.defineProperty(target, descriptor.key, descriptor);", "try{Object.defineProperty(target, descriptor.key, descriptor)}catch(e){target[descriptor.key] = descriptor.value}");
                    s = uglify.parse(s);
                    s.figure_out_scope();
                    s.compute_char_frequency();
                    s.mangle_names();
                    $$.set('pp_output', s.print_to_string({
                        ie8: true
                    }));
                },
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), __c_button("load - js", {
                class: "header",
                get: () => 'from JS',
                set: $$ => this.loadJS($$, $$('pp_output')),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), __c_editbox_code("pp_output", {
                class: "header",
                get: $$ => $$('pp_output'),
                set: ($$, value) => $$.set('pp_output', value),
                atr: () => ({
                        class: 'focus-front',
                        trigger: 'change',
                        style: 'width: 100px;',
                        ta: {
                            style: 'width: 1070px; font-size: 14px; height: 400px;',
                            offsetLeft: -500,
                            class: 'popup-editor-wrapper'
                        }
                    }),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; "
                } ]
            }), __c_button("validate", {
                class: "header",
                get: () => 'Simulate validation',
                set: $$ => this.validateTarget($$),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), __c_button("restart", {
                class: "header",
                get: () => 'Restart target',
                set: $$ => $$.runtime.target_runtime.restart(),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), __c_button("push2srv", {
                class: "header",
                get: () => 'Store in session',
                set: $$ => this.storeInSession($$),
                pos: [ {
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), __c_div_c("dfe_row", {
                get: $$ => this.allFields($$),
                atr: function($$) {
                    var a = $$('childrenOf'), b = $$('hierarchyOf'), c = $$('subChildren'), f = this.filterRow, ntp = new Map();
                    this.allFields($$).forEach(function(d) {
                        ntp.set(d.get('.name'), d);
                    });
                    return {
                        filter: function(px) {
                            return f(px, a, b, c, ntp);
                        },
                        class: 'div-flex-h',
                        style: 'box-sizing: border-box; overflow-y: scroll; height: 400px;',
                        rowclass$header: 'div-alt-color-fc',
                        orientation: 'horizontal',
                        events: {
                            mouseover: this.highlightField,
                            mouseleave: this.highlightField
                        }
                    };
                },
                pos: [ {
                    colclass: "div-flex-col",
                    colstyle: "margin: 0px; padding: 0px; width: max-content; width: -moz-max-content;"
                } ]
            }, [ __c_label("up_field_h", {
                class: "header",
                get: () => 'x',
                atr: () => ({ style: 'visibility:hidden'}),
                pos: [ {
                    colclass: "div-flex-col sticky-header",
                    colstyle: "border-top-left-radius: 3px;"
                } ]
            }), __c_label("name_field_h", {
                class: "header",
                get: () => 'Field name',
                pos: [ {
                    colclass: "div-flex-col sticky-header"
                } ]
            }), __c_label("parent_field_h", {
                class: "header",
                get: () => 'Parent',
                pos: [ {
                    colclass: "div-flex-col sticky-header"
                } ]
            }), __c_label("type_field_h", {
                class: "header",
                get: () => 'Type',
                pos: [ {
                    colclass: "div-flex-col sticky-header"
                } ]
            }), __c_label("get_field_h", {
                class: "header",
                get: () => 'Getter',
                pos: [ {
                    colclass: "div-flex-col sticky-header"
                } ]
            }), __c_label("set_field_h", {
                class: "header",
                get: () => 'Setter',
                pos: [ {
                    colclass: "div-flex-col sticky-header"
                } ]
            }), __c_label("val_field_h", {
                class: "header",
                get: () => 'Validation',
                pos: [ {
                    colclass: "div-flex-col sticky-header"
                } ]
            }), __c_label("attr_field_h", {
                class: "header",
                get: () => 'Attributes',
                pos: [ {
                    colclass: "div-flex-col sticky-header"
                } ]
            }), __c_label("del_field_h", {
                class: "header",
                get: () => 'Del.',
                pos: [ {
                    colclass: "div-flex-col sticky-header",
                    colstyle: "margin-bottom: 0px;"
                } ]
            }), __c_label("class_field_h", {
                class: "header",
                get: () => 'Class',
                pos: [ {
                    colclass: "div-flex-col sticky-header",
                    colstyle: "margin-bottom: 0px;"
                } ]
            }), __c_label("ppos_field_h", {
                class: "header",
                get: () => 'Layout specific',
                atr: () => ({
                        style: 'white-space: nowrap;'
                    }),
                pos: [ {
                    colclass: "div-flex-col sticky-header",
                    colstyle: "border-top-right-radius: 3px;margin-bottom: 0px;"
                } ]
            }), __c_editbox("field_index", {
                get: $$ => $$.index().toString(),
                set: ($$, value) => this.moveField($$, value),
                atr: $$ => ({
                        events: {
                            focus: function(e, c) {
                                c.ui.setSelectionRange(0, 99);
                            }
                        },
                        trigger: 'change',
                        style: $$('..component') == 0 ? 'visibility:hidden;' : '',
                        class: 'editor-pos-fld'
                    }),
                pos: [ {
                    colclass: "div-flex-col editbox-col --hover-visible"
                } ]
            }), __c_editbox("name_field", {
                get: $$ => $$('.name'),
                set: ($$, value) => this.changeName($$, value),
                pos: [ {
                    colclass: "div-flex-col"
                } ]
            }), __c_dropdown("parent_field", {
                get: $$ => ({
                        value: $$('..name'),
                        items: this.allFields($$).filter(function(px) {
                            return px.get('.component').isContainer && px.get('.name') != $$.get('.name');
                        }).map(function(px) {
                            return px.get('.name');
                        }).sort()
                    }),
                set: ($$, value) => this.changeParent($$, value),
                atr: $$ => ({ style: $$('..component') == 0 ? 'visibility:hidden;' : 'width: 100%;' }),
                pos: [ {
                    colclass: "div-flex-col"
                } ]
            }), __c_dropdown("type_field", {
                get: $$ => ({
                        value: $$('.component').cname,
                        items: [ '{{unknown}}', 'button', 'c-checkbox', 'c-dropdown', 'c-editbox', 'c-editbox-$', 'c-radiolist', 'checkbox', 'component', 'container', 'dfe-runtime', 'dfe-table', 'div', 'div-button', 'div-button-x', 'div-c', 'div-r', 'dropdown', 'editbox', 'editbox-$', 'editbox-P', 'form', 'html', 'label', 'label-i', 'multioption', /*'placeholder',*/ 'radiolist', 'switch', 'tab-d', 'tab-s', 'textarea', 'typeahead' ]
                    }),
                set: ($$, value)  => this.changeType($$, value),
                pos: [ {
                    colclass: "div-flex-col editbox-col"
                } ]
            }), __c_editbox_code("get_field", {
                get: function($$) {
                    if ($$('.get') == this.compilationerror) $$.control.data = this.codeToText(this.compilationerror); else return this.codeToText($$('.get'));
                },
                set: function($$, value) {
                    $$.listener.set($$.data, 'get', this.textToCode($$.runtime, value));
                    $$.listener.notify($$.data, 'component');
                },
                val: $$ => $$('.get') == this.compilationerror && $$.error('Compilation error'),
                atr: () => ({
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        eclass: 'editbox-error',
                        ta: {
                            func: {
                                template: '$$ => {}'
                            },
                            offsetLeft: -100,
                            class: 'popup-editor-wrapper',
                            eclass: 'popup-code-editor-erroring'
                        }
                    }),
                pos: [ {
                    colclass: "div-flex-col"
                } ]
            }), __c_editbox_code("set_field", {
                get: function($$) {
                    if ($$('.set') == this.compilationerror) $$.control.data = this.codeToText(this.compilationerror); else return this.codeToText($$('.set'));
                },
                set: function($$, value) {
                    $$.listener.set($$.data, 'set', this.textToCode($$.runtime, value));
                    $$.listener.notify($$.data, 'component');
                },
                val: $$ => $$('.set') == this.compilationerror && $$.error('Compilation error'),
                atr: () => ({
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        eclass: 'editbox-error',
                        ta: {
                            func: {
                                template: '($$, value) => {}'
                            },
                            offsetLeft: -100,
                            class: 'popup-editor-wrapper',
                            eclass: 'popup-code-editor-erroring'
                        }
                    }),
                pos: [ {
                    colclass: "div-flex-col"
                } ]
            }), __c_editbox_code("val_field", {
                get: function($$) {
                    if ($$('.val') == this.compilationerror) $$.control.data = this.codeToText(this.compilationerror); else return this.codeToText($$('.val'));
                },
                set: function($$, value) {
                    $$.listener.set($$.data, 'val', this.textToCode($$.runtime, value));
                    $$.listener.notify($$.data, 'component');
                },
                val: $$ => $$('.val') == this.compilationerror && $$.error('Compilation error'),
                atr: () => ({
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        eclass: 'editbox-error',
                        ta: {
                            func: {
                                template: '$$ => {}'
                            },
                            offsetLeft: -100,
                            class: 'popup-editor-wrapper',
                            eclass: 'popup-code-editor-erroring'
                        }
                    }),
                pos: [ {
                    colclass: "div-flex-col"
                } ]
            }), __c_editbox_code("attr_field", {
                get: function($$) {
                    if ($$('.atr') == this.compilationerror) $$.control.data = this.codeToText(this.compilationerror); else return this.codeToText($$('.atr'));
                },
                set: function($$, value) {
                    $$.listener.set($$.data, 'atr', this.textToCode($$.runtime, value));
                    $$.listener.notify($$.data, 'component');
                },
                val: $$ => $$('.atr') == this.compilationerror && $$.error('Compilation error'),
                atr: () => ({
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        eclass: 'editbox-error',
                        ta: {
                            func: {
                                template: '$$ => {}'
                            },
                            offsetLeft: -100,
                            class: 'popup-editor-wrapper',
                            eclass: 'popup-code-editor-erroring'
                        }
                    }),
                pos: [ {
                    colclass: "div-flex-col"
                } ]
            }), __c_div_button("field_del", {
                get: $$ => 'X',
                set: $$ => $$.detach(),
                atr: $$ => ({
                        class: 'div-button',
                        style: 'padding: 2px 5px; min-height: initial;' + ($$('..component') == 0 ? 'visibility:hidden;' : '')
                    }),
                pos: [ {
                    colclass: "div-flex-col editbox-col",
                    colstyle: "padding: 0px; margin: 0px"
                } ]
            }), __c_dropdown("class_field", {
                get: $$ => ({
                        value: $$('.class'),
                        items: [ '', 'header', 'footer' ]
                    }),
                set: function($$, value) {
                    $$.set('.class', value);
                    $$.listener.notify($$.get('..').data, 'children');
                },
                atr: $$ => ({
                        style: $$('..component') == 0 ? 'visibility:hidden;' : ''
                    }),
                pos: [ {
                    colclass: "div-flex-col editbox-col"
                } ]
            }), __c_div("layout_spec_ctrl", {
                get: $$ => [ $$('.pos')[+$$('.pos_idx')] ],
                atr: $$ => ({
                        style: 'padding:0px 1px 0px 1px; display: flex; flex-direction: row;',
                        skip: [ this.getContainerLayout($$) == 'tpos' ? 'dpos_ctrl' : 'tpos_ctrl' ]
                    })
            }, [ __c_button("layout_spec_arrows_left", {
                class: "header",
                get: () => '<',
                set: $$ => $$.set('.pos_idx', +$$('.pos_idx') - 1),
                atr: $$ => ({
                        disabled: $$('.pos_idx') == 0,
                        style: 'padding-left: 1px; padding-right: 1px; margin-right: 1px; ' + ($$('.pos_idx') == 0 ? '' : 'font-weight: bold;') + ' color: black;'
                    }),
                pos: [ {
                    colstyle: "display: inline; margin-top: 2px;"
                } ]
            }), __c_button("layout_spec_arrows_right", {
                class: "header",
                get: $$ => '>',
                set: $$ => $$.set('.pos_idx', +$$('.pos_idx') + 1),
                atr: $$ => ({
                        disabled: $$('.pos_idx') == $$('.pos').length - 1,
                        style: 'padding-left: 1px; padding-right: 1px; margin-right: 1px; ' + ($$('.pos_idx') == $$('.pos').length - 1 ? '' : 'font-weight: bold;') + ' color: black;'
                    }),
                pos: [ {
                    colstyle: "display: inline; margin-top: 2px;"
                } ]
            }), __c_div("tpos_ctrl", {
                get: $$ => [ $$ ],
                atr: () => ({
                        class: 'div-flex-row'
                    }),
                pos: [ {
                    colclass: "div-flex-col-embedded-1"
                } ]
            }, [ __c_label("tpos_col_w", {
                get: () => 'Width:',
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }), __c_dropdown("tpos_field_w", {
                get: $$ => ({
                        value: $$('.w'),
                        items: [ '', 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
                    }),
                set: ($$, value) => this.changePos($$, '.w', value),
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }), __c_label("tpos_col_h", {
                get: () => 'Height:',
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }), __c_dropdown("tpos_field_h", {
                get: $$ => ({
                        value: $$('.h'),
                        items: [ '', 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
                    }),
                set: ($$, value) => this.changePos($$, '.h', value),
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }), __c_checkbox("tpos_field_n", {
                get: $$ => ({
                        checked: $$('.n'),
                        text: '<'
                    }),
                set: ($$, value) => this.changePos($$, '.n', value),
                atr: () => ({
                        style: 'display: flex; align-items: center;'
                    }),
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }), __c_editbox("tpos_field_s", {
                get: $$ => $$('.s'),
                set: ($$, value) => this.changePos($$, '.s', value),
                atr: () => ({
                        style: 'width: 100px'
                    }),
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }) ]), __c_div("dpos_ctrl", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                        style: $$('...component') == 0 ? 'visibility: hidden' : '',
                        class: 'div-flex-row'
                    }),
                pos: [ {
                    colclass: "div-flex-col-embedded-1"
                } ]
            }, [ __c_label("dpos_colclass_l", {
                get: () => 'Class:',
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }), __c_editbox("dpos_colclass", {
                get: $$ => $$('.colclass'),
                set: ($$, value) => this.changePos($$, '.colclass', value),
                atr: () => ({
                        style: 'width: 100px'
                    }),
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }), __c_label("dpos_colstyle_l", {
                get: () => 'Style:',
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }), __c_editbox("dpos_colstyl", {
                get: $$ => $$('.colstyle'),
                set: ($$, value) => this.changePos($$, '.colstyle', value),
                atr: () => ({
                        style: 'width: 113px'
                    }),
                pos: [ {
                    colclass: "div-flex-col-embedded"
                } ]
            }) ]) ]) ]) ]);
        }
        allFields($$) {
            var dfe = $$.get('dfe'), form = dfe[0] && dfe[0].data.form;
            return function tr(lst, out) {
                lst.forEach(function(i) {
                    i.data.form == form && out.push(i);
                    tr(i.get('.children'), out);
                });
                return out;
            }(dfe, []);
        }
        codeToText(fn) {
            return fn.toString().replace(/^function[^(]*/, 'function').replace(/\n\/\*``\*\//, '');
        }
        textToCode(runtime, code) {
            var obj = runtime.target_runtime.form, dp = 'var __=1', t = window.opener || window;
            for (var d in obj.dependencies) obj.dependencies[d].match(/components\//) || (dp += ', ' + d + '=target.require("' + obj.dependencies[d] + '")');
            try {
                if (typeof code == 'string' && code.length > 0) {
                    try {
                        if (uglify.parse(code).body[0].body instanceof uglify.AST_Arrow) {
                            return new Function('code', 'target', dp + '; return eval(code)').call(obj, code, t);
                            // to set 'this' of arrow function to form
                                                }
                    } catch (e) {}
                    return t.eval('(function() { var target = this; ' + dp + ';return ' + code + '})()');
                }
                return undefined;
            } catch (e) {
                console.error('Compilation error [' + e.message + '] for:\n' + code);
                return this.compilationerror;
            }
        }
        runtimeToJs(obj) {
            var cc = [], dp = '', cts = obj.constructor.toString(), ast;
            if (!cts.match(/^class/)) cts = 'class {\n' + Object.getOwnPropertyNames(obj.__proto__).map(function(p) {
                var s = obj[p].toString();
                return s.replace('function ', s.match(/function \(\)/) ? 'constructor' : '').replace(/"use strict";/, '');
            }).join('\n') + '\n}';
            ast = uglify.parse('new ' + cts);
            for (var d in obj.dependencies) {
                cc.push(obj.dependencies[d]);
                dp += (dp == 0 ? '' : ',') + d;
            }
            var self = this, f = function collect(dfe) {
                return dfe[0] && dfe[0].form == obj && dfe.map(function(r) {
                    var c = r.component.cname, cf = collect(r.children)||'', cn;
                    if(c.match(/^forms\//)) {
                        cn = '__f_' + c.replace(/.*(?=\/\w+$)/g,'').substr(1);
                        cc.indexOf(c) == -1 && (dp += ', ' + cn) && cc.push(c);
                    } else {
                        cn = '__c_' + c.replace(/\-|\//g, '_');
                        cc.indexOf('components/' + c) == -1 && (dp += ', ' + cn) && cc.push('components/' + c);
                    }
                    var field = cn + '("' + r.name + '",{', cma = '';
                    [ 'class', 'get', 'set', 'val', 'atr', 'oncreate', 'preRender', 'postRender' ].forEach(function(p) {
                        if (typeof r[p] != 'undefined') {
                            field += cma + p + ': ' + (typeof r[p] == 'function' ? self.codeToText(r[p]) : '"' + r[p] + '"');
                            cma = ',';
                        }
                    });
                    field += JSON.stringify(r.pos).match(/^\[[{},]*\]$/) ? '' : cma + 'pos:' + JSON.stringify(r.pos);
                    field += '}' + (cf == 0 ? '' : ',[' + cf + ']') + ')';
                    return field;
                }).join(',');
            }(obj.dfe);
            ast.body[0].body.expression.properties.forEach(function(p) {
                if (p instanceof uglify.AST_ConciseMethod && p.key.name == 'constructor') 
                	for (var b = p.value.body, i = 0; i < b.length; i++) 
                		if (b[i].body instanceof uglify.AST_Assign && b[i].body.left.property == 'dfe') 
                			b[i] = uglify.parse('this.dfe=' + f);
            });
            var enc = uglify.parse('defineForm(["' + cc.join('", "') + '"], function (' + dp + ') { return ' + ast.print_to_string({
                quote_style: 3,
                beautify: true,
                comments: true
            }) + '})');
            return enc.print_to_string({
                quote_style: 3,
                beautify: true,
                comments: true
            });
            //, ie8: true
        }
        storeInSession($$) {
            function ajaxPost(data, url, accept, error) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.setRequestHeader("Content-type", "text/plain");
                xhr.onreadystatechange = function() {
                    try {
                        xhr.readyState == 4 && xhr.status == 200 && typeof accept == 'function' && accept(xhr.responseText, xhr.statusText);
                        xhr.readyState == 4 && xhr.status != 200 && typeof error == 'function' && error(xhr, xhr.statusText, null);
                    } catch (e) {
                        typeof error == 'function' && error(xhr, 'error', e);
                    }
                };
                xhr.send(data);
            }
            let es6 = this.runtimeToJs($$.data);
            let es5 = babel.transform(es6, { plugins: [ 'transform-es3-property-literals', 'transform-es3-member-expression-literals' ], presets: [ 'es2015' ] }).code;
            ajaxPost(JSON.stringify({es6: es6, es5: es5}), '/DfeServlet.srv?a=dfe&p=' + $$.data.name, function(d, s) {
                alert(s);
            }, function(xhr, s) {
                xhr.responseText ? displayServerError(xhr.responseText) : displayServerError(JSON.stringify(xhr));
            });
        }
        filterRow(row, childrenOf, hierarchyOf, subChildren, ntp) {
            if (childrenOf != 0 && childrenOf != 'All') {
                while (childrenOf != row.get('.name')) {
                    if (!(row = row.get('..')) || subChildren != 'Y' && childrenOf != row.get('.name')) return false;
                }
            }
            if (hierarchyOf != 0 && hierarchyOf != 'All') {
                for (var d = ntp.get(hierarchyOf), n = row.get('.name'); d; d = d.get('..')) if (d.get('.name') == n) return true;
                return false;
            }
            return true;
        }
        getContainerLayout(proxy) {
            return proxy.get('..component').layout;
        }
        highlightField(e, control) {
            var rt = control.model.runtime && control.model.runtime.target_runtime;
            if (!rt) return;
            var cc, doc = rt.rootControls[0].ui.ownerDocument, clazz = '__marker__', ui, r, sp, hl = 'background: peru;', body = doc.getElementsByTagName('body')[0], mrk = doc.getElementsByClassName(clazz);
            for (var i = mrk.length; i > 0; i--, mrk[i].parentElement.removeChild(mrk[i])) ;
            var dom = document.elementFromPoint(e.clientX, e.clientY), c, proxy;
            while (dom && !dom._dfe_) dom = dom.parentNode;
            if (dom && (c = dom._dfe_) && (proxy = c.model)) {
                if (e.type == 'mouseover') {
                    do {
                        if (rt.findControls(proxy.get('.name')).filter(function(c) {
                            if(Array.isArray(c._allParentNodes)) {
                                var a;
                                c._allParentNodes.forEach(function(ui){
                                    if((r = ui.getBoundingClientRect()) && (r.x || r.width)){
                                        a = true;
                                        body.appendChild(sp = doc.createElement('span'));
                                        sp.setAttribute('style', 'position: absolute; z-index: 3000; opacity: 0.5; border-radius: 5px; ' + hl);
                                        sp.setAttribute('class', '__marker__');
                                        sp.style.top = r.top - 3 + (doc.defaultView.scrollY || doc.defaultView.window.pageYOffset) + 'px';
                                        sp.style.left = r.left - 4 + (doc.defaultView.scrollX || doc.defaultView.window.pageXOffset) + 'px';
                                        sp.style.width = r.width + 10 + 'px';
                                        sp.style.height = r.height + 6 + 'px';
                                    }
                                })
                                return a;
                            }
                        }).length > 0) break;
                        proxy.get('.name') != 0 && (hl = 'border: dashed; border-color: red;'), proxy = proxy.get('..');
                    } while (proxy);
                }
            }
        }
        changeName(px, value) {
            if (value == 0 || this.allFields(px).filter(function(p) {
                return p.get('.name') == value;
            }) != 0) {
                px.listener.notify(px.data, 'name', 'm');
            } else {
                px.set('.name', value);
                px.listener.notify(px.get('..').data, 'children');
            }
        }
        moveField(proxy, newpos) {
            var idx = proxy.index(), ch = proxy.get('..children');
            newpos = newpos >= ch.length ? ch.length - 1 : newpos;
            if (idx != newpos && newpos >= 0) {
                var data = proxy.get('..').data;
                data.children.splice(newpos, 0, data.children.splice(idx, 1).shift());
                proxy.listener.notify(data, 'children', 'm');
            }
        }
        changeParent(px, value) {
            var par = this.allFields(px).filter(function(p) {
                return p.get('.name') == value;
            }).pop();
            px.detach();
            cmn.extend( px.data, par.append('.children')[0].data );
        }
        changePos(px, prop, value) {
            if (px) {
                var fpx = px.get('..');
                px.listener.notify(fpx.get('..').data, 'children');
                prop && px.set(prop, value);
                fpx.data.pos = cmn.extend(fpx.data.pos, []);
            }
        }
        changeType(px, value) {
            require([ 'components/' + value ], function(c) {
                px.listener.set(px.data, 'component', c);
                px.listener.notify(px.get('..').data, 'children');
                var pos = [];
                for (var i = 0; i < c.slots; i++) pos.push({});
                for (var i = px.data.pos.length, j = c.slots; i > 0 && j > 0; ) cmn.extend(px.data.pos[--i], pos[--j]);
                px.listener.set(px.data, 'pos', pos);
                px.set('.pos_idx');
            });
        }
        validateTarget($$) {
            var tr = $$.runtime.target_runtime, formName = $$.data.name;
            tr.notifyControls(Array.from(tr.controls), 'validate');
        }
        loadJS($$, script) {
            var tr = $$.runtime.target_runtime, formName = $$.data.name, t = window.opener || window;
            t.requirejs.undef('forms/' + formName);
            t.eval(script.replace('defineForm(', 'defineForm("' + formName + '",'));
            t.require([ 'forms/' + formName ], function(dfe) {
                tr.setDfeForm(dfe.form).restart();
                $$.runtime.setModel(dfe.form).restart();
            });
        }
        generateName(px) {
            for (var n = this.allFields(px).map(function(p) {
                return p.get('.name');
            }), i = 1; n.indexOf('field-' + i) != -1; i++) ;
            return 'field-' + i;
        }
        onstart($$) {
            try {
                $$.set('pp_output', this.runtimeToJs($$.data));
            } catch (e) {
                console.warn('failed to process form model: ' + e);
            }
        }
        setup(runtime) {
            this.compilationerror = function($$) {
                $$.error('compilation error');
            };
        }
    }();
});