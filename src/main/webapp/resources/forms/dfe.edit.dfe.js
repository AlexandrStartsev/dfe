defineForm("dfe.edit.dfe", [ "require", "uglify", "babel", "dfe-common", "components/div-r", "components/button", "components/label", "components/dropdown", "components/checkbox", "components/editbox-code", "components/editbox-P", "components/div-c", "components/editbox", "components/div", "components/div-button" ], function(require, uglify, babel, cmn) {
    return new class {
        constructor() {
            this.dfe = [ {
                name: "root",
                component: require("components/div-r"),
                get: function($$) {
                    return [ $$ ];
                },
                atr: function($$) {
                    return {
                        "class": 'div-flex',
                        rowclass: 'div-flex-row',
                        rowstyle: 'border: 1px solid; border-color: darkgray; border-radius: 5px; width: min-content; width: -moz-min-content;',
                        rowstyle$header: 'display: table',
                        rowclass$footer: 'div-flex-row',
                        rowstyle$footer: 'flex-wrap: wrap; width: 800px;'
                    };
                }
            }, {
                name: "add_dfe",
                component: require("components/button"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return '+';
                },
                set: function($$, value) {
                    var pname = $$('childrenOf') == 0 ? $$('dfe.name')[0] : $$('childrenOf');
                    $$.append('dfe', {
                        name: this.generateName($$),
                        get: $$ => [$$],
                        parent: pname,
                        pos: [{}]
                    })[0].set('.component', require('components/editbox'));
                    this.rebuildChildren(this.nameToPx($$).get(pname));
                },
                pos: [{
                    colstyle: "display: inline; height: min-content;"
                }]
            }, {
                name: "l1",
                component: require("components/label"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'Show only children of: ';
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; "
                }]
            }, {
                name: "childrenOf",
                component: require("components/dropdown"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return {
                        value: $$('childrenOf'),
                        items: [ {
                            value: [],
                            description: 'All'
                        } ].concat($$('dfe').filter(function(px) {
                            return px.get('.children') != 0;
                        }).map(function(px) {
                            return px.get('.name');
                        }).sort().map(function(s) {
                            return {
                                value: s
                            };
                        }))
                    };
                },
                set: function($$, value) {
                    $$.set('hierarchyOf', []);
                    $$.set('childrenOf', value);
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; "
                }]
            }, {
                name: "subChildren",
                component: require("components/checkbox"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return {
                        checked: $$('subChildren'),
                        text: ''
                    };
                },
                set: function($$, value) {
                    $$.set('subChildren', value);
                },
                atr: () => ({ style: 'display: inline'}),
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; "
                }]
            }, {
                name: "l2",
                component: require("components/label"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'Show hierarchy: ';
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; "
                }]
            }, {
                name: "hierarchyOf",
                component: require("components/dropdown"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return {
                        value: $$('hierarchyOf'),
                        items: [ {
                            value: [],
                            description: 'All'
                        } ].concat($$('dfe').map(function(px) {
                            return px.get('.name');
                        }).sort().map(function(s) {
                            return {
                                value: s
                            };
                        }))
                    };
                },
                set: function($$, value) {
                    $$.set('childrenOf', []);
                    $$.set('hierarchyOf', value);
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; "
                }]
            }, {
                name: "append_css",
                component: require("components/button"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'Custom CSS:';
                },
                set: function($$, value) {
                    this.pushCSStoPage($$('css'), 'custom-css-dfe');
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                }]
            }, {
                name: "css_text",
                component: require("components/editbox-code"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return $$('css');
                },
                set: function($$, value) {
                    $$.set('css', value);
                },
                atr: function($$) {
                    return {
                        "class": 'focus-front',
                        trigger: 'change',
                        style: 'width: 100px;',
                        ta: {
                            style: 'width: 1070px; height: 400px;',
                            lang: 'css',
                            offsetLeft: -200,
                            'class': 'popup-editor-wrapper'
                        }
                    };
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; "
                }]
            }, {
                name: "JS",
                component: require("components/button"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'to JS';
                },
                set: function($$, value) {
                	$$.set('pp_output', this.runtimeToJs($$.data));
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                }]
            }, {
                name: "JS - min",
                component: require("components/button"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'to JS(min)';
                },
                set: function($$, value) {
                	var s = babel.transform(this.runtimeToJs($$.data), { plugins: ['transform-es3-property-literals', 'transform-es3-member-expression-literals'], presets : ['es2015']}).code;
                	//s = s.replace('defineForm("' + $$.data.name + '"', 'defineForm("' + $$.data.name + '.min"');
                	s = s.replace("Object.defineProperty(target, descriptor.key, descriptor);", "target[descriptor.key] = descriptor.value;");
                	s = uglify.parse(s);
                    s.figure_out_scope();
                    s.compute_char_frequency();
                    s.mangle_names();
                    $$.set('pp_output', s.print_to_string({ie8: true}) );
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                }]
            }, {
                name: "load - js",
                component: require("components/button"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'from JS';
                },
                set: function($$, value) {
                    this.loadJS($$, $$('pp_output'));
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                }]
            }, {
                name: "pp_output",
                component: require("components/editbox-code"),
                parent: "root",
                "class": "header",
                set: function($$, value) {
                    $$.set('pp_output', value);
                },
                get: function($$) {
                	return $$('pp_output')
                },
                atr: function($$) {
                    return {
                        "class": 'focus-front',
                        trigger: 'change',
                        style: 'width: 100px;',
                        ta: {
                            style: 'width: 1070px; font-size: 14px; height: 400px;',
                            offsetLeft: -500,
                            'class': 'popup-editor-wrapper'
                        }
                    };
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; "
                }]
            }, {
                name: "validate",
                component: require("components/button"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'Simulate validation';
                },
                set: function($$, value) {
                    this.validateTarget($$);
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                }]
            }, {
                name: "restart",
                component: require("components/button"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'Restart target';
                },
                set: function($$, value) {
                    $$.runtime.target_runtime.restart();
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                }]
            }, {
                name: "push2srv",
                component: require("components/button"),
                parent: "root",
                "class": "header",
                get: function($$) {
                    return 'Store in session';
                },
                set: function($$, value) {
                    this.storeInSession($$);
                },
                pos: [{
                    colstyle: "display: inline; margin-left: 2px; height: min-content;"
                }]
            }, {
                name: "dfe_row",
                component: require("components/div-c"),
                parent: "root",
                get: function($$) {
                    return $$('dfe');
                },
                atr: function($$) {
                    return {
                        filter: this.getFieldList($$, $$('childrenOf'), $$('hierarchyOf'), $$('subChildren')),
                        "class": 'div-flex-h',
                        style: 'box-sizing: border-box; overflow-y: scroll; height: 400px;',
                        rowclass$header: 'div-alt-color-fc',
                        orientation: 'horizontal',
                        events: {
                            mouseover: this.highlightField,
                            mouseleave: this.highlightField
                        }
                    };
                },
                pos: [{
                    colclass: "div-flex-col",
                    colstyle: "margin: 0px; padding: 0px; width: max-content; width: -moz-max-content;"
                }]
            }, {
                name: "up_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'x';
                },
                atr: function($$) {
                    return {
                        style: 'visibility:hidden'
                    };
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header",
                    colstyle: "border-top-left-radius: 3px;"
                }]
            }, {
                name: "name_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Field name';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header"
                }]
            }, {
                name: "parent_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Parent';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header"
                }]
            }, {
                name: "type_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Type';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header"
                }]
            }, {
                name: "get_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Getter';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header"
                }]
            }, {
                name: "set_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Setter';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header"
                }]
            }, {
                name: "val_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Validation';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header"
                }]
            }, {
                name: "attr_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Attributes';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header"
                }]
            }, {
                name: "del_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Del.';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header",
                    colstyle: "margin-bottom: 0px;"
                }]
            }, {
                name: "class_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Class';
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header",
                    colstyle: "margin-bottom: 0px;"
                }]
            }, {
                name: "ppos_field_h",
                component: require("components/label"),
                parent: "dfe_row",
                "class": "header",
                get: function($$) {
                    return 'Layout specific';
                },
                atr: function($$) {
                    return {
                        style: 'white-space: nowrap;'
                    };
                },
                pos: [{
                    colclass: "div-flex-col -sticky-header",
                    colstyle: "border-top-right-radius: 3px;margin-bottom: 0px;"
                }]
            }, {
                name: "field_index",
                component: require("components/editbox"),
                parent: "dfe_row",
                get: function($$) {
                    return $$.index();
                },
                set: ($$, value) => this.moveField($$, value),
                atr: function($$) {
                    return {
                        events: {
                            focus: function(e, c) {
                                c.ui.setSelectionRange(0, 99);
                            }
                        },
                        trigger: 'change',
                        style: $$.index() ? '' : 'visibility:hidden;',
                        "class": 'editor-pos-fld'
                    };
                },
                pos: [{
                    colclass: "div-flex-col editbox-col --hover-visible"
                }]
            }, {
                name: "name_field",
                component: require("components/editbox"),
                parent: "dfe_row",
                get: function($$) {
                    return $$('.name');
                },
                set: function($$, value) {
                    this.changeName($$, value);
                },
                pos: [{
                    colclass: "div-flex-col"
                }]
            }, {
                name: "parent_field",
                component: require("components/dropdown"),
                parent: "dfe_row",
                get: function($$) {
                    return {
                        value: $$('.parent'),
                        items: $$('dfe').filter(function(px) {
                            return px.get('.component').isContainer;
                        }).map(function(px) {
                            return px.get('.name');
                        }).sort().map(function(s) {
                            return {
                                value: s
                            };
                        })
                    };
                },
                set: function($$, value) {
                    this.changeParent($$, value);
                },
                atr: function($$) {
                    return {
                        style: $$('.parent') == 0 ? 'visibility:hidden;' : ''
                    };
                },
                pos: [{
                    colclass: "div-flex-col"
                }]
            }, {
                name: "type_field",
                component: require("components/dropdown"),
                parent: "dfe_row",
                get: function($$) {
                    return {
                        value: $$('.component').name,
                        items: [ '{{unknown}}', 'button', 'c-checkbox', 'c-dropdown', 'c-editbox', 'c-editbox-$', 'c-radiolist', 'checkbox', 'component', 'container', 'div', 'div-button', 'div-button-x', 'div-c', 'div-r', 'dropdown', 'editbox', 'editbox-$', 'editbox-P', 'html', 'label', 'multioption', /*'placeholder',*/ 'radiolist', 'tab-s', 'textarea', 'typeahead' ]
                    };
                },
                set: function($$, value) {
                    this.changeType($$, value);
                },
                pos: [{
                    colclass: "div-flex-col editbox-col"
                }]
            }, {
                name: "get_field",
                component: require("components/editbox-code"),
                parent: "dfe_row",
                get: function($$) {
                    if ($$('.get') == this.compilationerror) $$.control.data = this.codeToText(this.compilationerror); else return this.codeToText($$('.get'));
                },
                set: function($$, value) {
                	$$.listener.set($$.data, 'get', this.textToCode($$.runtime, value));
                    $$.listener.notify($$.data, 'component');
                },
                val: function($$) {
                    $$('.get') == this.compilationerror && $$.error('Compilation error');
                },
                atr: function($$) {
                    return {
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        eclass: 'editbox-error',
                        ta: {
                            func: {
                                template: '$$ => {}'
                            },
                            offsetLeft: -100,
                            'class': 'popup-editor-wrapper',
                            eclass: 'popup-code-editor-erroring'
                        }
                    };
                },
                pos: [{
                    colclass: "div-flex-col"
                }]
            }, {
                name: "set_field",
                component: require("components/editbox-code"),
                parent: "dfe_row",
                get: function($$) {
                    if ($$('.set') == this.compilationerror) $$.control.data = this.codeToText(this.compilationerror); else return this.codeToText($$('.set'));
                },
                set: function($$, value) {
                	$$.listener.set($$.data, 'set', this.textToCode($$.runtime, value));
                    $$.listener.notify($$.data, 'component');
                },
                val: function($$) {
                    $$('.set') == this.compilationerror && $$.error('Compilation error');
                },
                atr: function($$) {
                    return {
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        eclass: 'editbox-error',
                        ta: {
                            func: {
                                template: '($$, value) => {}'
                            },
                            offsetLeft: -100,
                            'class': 'popup-editor-wrapper',
                            eclass: 'popup-code-editor-erroring'
                        }
                    };
                },
                pos: [{
                    colclass: "div-flex-col"
                }]
            }, {
                name: "val_field",
                component: require("components/editbox-code"),
                parent: "dfe_row",
                get: function($$) {
                    if ($$('.val') == this.compilationerror) $$.control.data = this.codeToText(this.compilationerror); else return this.codeToText($$('.val'));
                },
                set: function($$, value) {
                	$$.listener.set($$.data, 'val', this.textToCode($$.runtime, value));
                    $$.listener.notify($$.data, 'component');
                },
                val: function($$) {
                    $$('.val') == this.compilationerror && $$.error('Compilation error');
                },
                atr: function($$) {
                    return {
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        eclass: 'editbox-error',
                        ta: {
                            func: {
                                template: '$$ => {}'
                            },
                            offsetLeft: -100,
                            'class': 'popup-editor-wrapper',
                            eclass: 'popup-code-editor-erroring'
                        }
                    };
                },
                pos: [{
                    colclass: "div-flex-col"
                }]
            }, {
                name: "attr_field",
                component: require("components/editbox-code"),
                parent: "dfe_row",
                get: function($$) {
                    if ($$('.atr') == this.compilationerror) $$.control.data = this.codeToText(this.compilationerror); else return this.codeToText($$('.atr'));
                },
                set: function($$, value) {
                	$$.listener.set($$.data, 'atr', this.textToCode($$.runtime, value));
                    $$.listener.notify($$.data, 'component');
                },
                val: function($$) {
                    $$('.atr') == this.compilationerror && $$.error('Compilation error');
                },
                atr: function($$) {
                    return {
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        eclass: 'editbox-error',
                        ta: {
                            func: {
                                template: '$$ => {}'
                            },
                            offsetLeft: -100,
                            'class': 'popup-editor-wrapper',
                            eclass: 'popup-code-editor-erroring'
                        }
                    };
                },
                pos: [{
                    colclass: "div-flex-col"
                }]
            }, {
                name: "field_del",
                component: require("components/div-button"),
                parent: "dfe_row",
                get: function($$) {
                    return 'X';
                },
                set: function($$, value) {
                    this['delete']($$);
                },
                atr: function($$) {
                    return {
                        class: 'div-button',
                        style: 'padding: 2px 5px; min-height: initial;' + ($$('.parent') == 0 ? 'visibility:hidden;' : '')
                    };
                },
                pos: [{
                    colclass: "div-flex-col editbox-col",
                    colstyle: "padding: 0px; margin: 0px"
                }]
            }, {
                name: "class_field",
                component: require("components/dropdown"),
                parent: "dfe_row",
                get: function($$) {
                    return {
                        value: $$('.class'),
                        items: [ '', 'header', 'footer' ]
                    };
                },
                set: function($$, value) {
                    $$.set('.class', value);
                    this.changePos($$);
                },
                atr: function($$) {
                    return {
                        style: $$('.parent') == 0 ? 'visibility:hidden;' : ''
                    };
                },
                pos: [{
                    colclass: "div-flex-col editbox-col"
                }]
            }, {
                name: "layout_spec_ctrl",
                component: require("components/div"),
                parent: "dfe_row",
                get: function($$) {
                    return [$$('.pos')[+$$('.pos_idx')]]
                },
                atr: function($$) {
                    return {
                        style: 'padding:0px 1px 0px 1px; display: flex; flex-direction: row;',
                        skip: [ this.getContainerLayout($$) == 'tpos' ? 'dpos_ctrl' : 'tpos_ctrl' ] 
                    };
                }
            }, {
                name: "layout_spec_arrows_left",
                component: require("components/button"),
                parent: "layout_spec_ctrl",
                class: "header", 
                get: function($$) {
                    return '<';
                },
                set: function($$) {
                	$$.set('.pos_idx', +$$('.pos_idx') - 1)
                },
                atr: function($$) {
                    return {
                        disabled: $$('.pos_idx') == 0,
                        style: 'padding-left: 1px; padding-right: 1px; margin-right: 1px; font-weight: bold; color: black;' // border: 1px solid;
                    }
                },
                pos: [{
                	colstyle: 'display: inline; margin-top: 2px;'
                }]
            }, {
                name: "layout_spec_arrows_right",
                component: require("components/button"),
                parent: "layout_spec_ctrl",
                class: "header", 
                get: function($$) {
                    return '>';
                },
                set: function($$) {
                	$$.set('.pos_idx', +$$('.pos_idx') + 1)
                },
                atr: function($$) {
                    return {
                    	disabled: $$('.pos_idx') == $$('.pos').length - 1,
                    	style: 'padding-left: 1px; padding-right: 1px; margin-right: 1px; font-weight: bold; color: black;' // border: 1px solid;
                    }
                },
                pos: [{
                	colstyle: 'display: inline; margin-top: 2px;'
                }]
            }, {
                name: "tpos_ctrl",
                component: require("components/div"),
                parent: "layout_spec_ctrl",
                get: function($$) {
                    return [$$];
                },
                atr: function($$) {
                    return {
                        "class": 'div-flex-row'
                    };
                },
                pos: [{
                    colclass: "div-flex-col-embedded-1"
                }]
            }, {
                name: "tpos_col_w",
                component: require("components/label"),
                parent: "tpos_ctrl",
                get: function($$) {
                    return 'Width:';
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "tpos_field_w",
                component: require("components/dropdown"),
                parent: "tpos_ctrl",
                get: function($$) {
                    return {
                        value: $$('.w'),
                        items: [ '', 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
                    };
                },
                set: function($$, value) {
                    this.changePos($$, '.w', value);
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "tpos_col_h",
                component: require("components/label"),
                parent: "tpos_ctrl",
                get: function($$) {
                    return 'Height:';
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "tpos_field_h",
                component: require("components/dropdown"),
                parent: "tpos_ctrl",
                get: function($$) {
                    return {
                        value: $$('.h'),
                        items: [ '', 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
                    };
                },
                set: function($$, value) {
                	this.changePos($$, '.h', value);
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "tpos_field_n",
                component: require("components/checkbox"),
                parent: "tpos_ctrl",
                get: function($$) {
                    return {
                        checked: $$('.n'),
                        text: '<'
                    };
                },
                set: function($$, value) {
                    this.changePos($$, '.n', value);
                },
                atr: function() {
                    return { style: 'display: flex; align-items: center;' }
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "tpos_field_s",
                component: require("components/editbox"),
                parent: "tpos_ctrl",
                get: function($$) {
                    return $$('.s');
                },
                set: function($$, value) {
                    this.changePos($$, '.s', value);
                },
                atr: function($$) {
                    return {
                        style: 'width: 100px'
                    };
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "dpos_ctrl",
                component: require("components/div"),
                parent: "layout_spec_ctrl",
                get: function($$) {
                    return [ $$ ];
                },
                atr: function($$) {
                    return {
                        style: $$('..parent') == 0 ? 'visibility: hidden' : '',
                        "class": 'div-flex-row'
                    };
                },
                pos: [{
                    colclass: "div-flex-col-embedded-1"
                }]
            }, {
                name: "dpos_colclass_l",
                component: require("components/label"),
                parent: "dpos_ctrl",
                get: function($$) {
                    return 'Class:';
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "dpos_colclass",
                component: require("components/editbox"),
                parent: "dpos_ctrl",
                get: function($$) {
                    return $$('.colclass');
                },
                set: function($$, value) {
                	this.changePos($$, '.colclass', value);
                },
                atr: function($$) {
                    return {
                        style: 'width: 100px'
                    };
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "dpos_colstyle_l",
                component: require("components/label"),
                parent: "dpos_ctrl",
                get: function($$) {
                    return 'Style:';
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            }, {
                name: "dpos_colstyl",
                component: require("components/editbox"),
                parent: "dpos_ctrl",
                get: function($$) {
                    return $$('.colstyle');
                },
                set: function($$, value) {
                	this.changePos($$, '.colstyle', value);
                },
                atr: function($$) {
                    return {
                        style: 'width: 113px'
                    };
                },
                pos: [{
                    colclass: "div-flex-col-embedded"
                }]
            } ]
        }
        codeToText(fn) {
            return fn.toString().replace(/^function[^(]*/,'function').replace(/\n\/\*``\*\//,'');
        }
        textToCode(runtime, code) {
        	var obj = runtime.target_runtime.form, dp = 'var __=1', t = window.opener || window;
        	for(var d in obj.dependencies) 
                obj.dependencies[d].match(/components\//)||(dp += ', ' + d + '=target.require("' + obj.dependencies[d] + '")');
            try {
                if(typeof code == 'string' && code.length > 0) {
                    try {
                        if(uglify.parse(code).body[0].body instanceof uglify.AST_Arrow) { 
                            return new Function('code', 'target', dp + '; return eval(code)').call(obj, code, t); // to set 'this' of arrow function to form
                        }
                    } catch(e) {}
                    return t.eval('(function() { var target = this; ' + dp + ';return ' + code + '})()');
                }
                return undefined;
            } catch (e) {
                console.error('Compilation error [' + e.message + '] for:\n' + code);
                return this.compilationerror;
            }
        }
        
        runtimeToJs(obj) {
            var cc = ['require'], fields = [], dp='require', cts = obj.constructor.toString(), ast;
            if(!cts.match(/^class/)) 
            	cts = 'class {\n' + Object.getOwnPropertyNames(obj.__proto__).map(function(p) { 
            		var s = obj[p].toString(); 
            		return s.replace('function ', s.match(/function \(\)/) ? 'constructor' : '').replace(/"use strict";/,'')  
            	}).join('\n') + '\n}';
            ast = uglify.parse('new ' + cts);
            for(var d in obj.dependencies) 
                obj.dependencies[d].match(/components\//)||(dp += ', ' + d, cc.push(obj.dependencies[d]))
            obj.dfe.forEach(function(r, i) {
                var c = r.component.name, cn = '__c_' + c.replace(/\-/g,'_'); 
                cc.indexOf('components/' + c) == -1 && (dp += ', ' + cn) && cc.push('components/' + c);
                var field = '{name:"' + r.name + '", component: ' + cn + ',';
                ['parent', 'class', 'get', 'set', 'val', 'atr'].forEach(function(p){
                    if(r[p] != 0) {
                        var v = typeof r[p] == 'function' ? this.codeToText(r[p]) : r[p];
                        r[p] && (field += p + ': ' + ( p == 'class' || p == 'parent' ? '"' + v + '"' : v ) + ',')
                    }
                }, this);
                JSON.stringify(r.pos).match(/^\[[{},]*\]$/) || (field += 'pos:' + JSON.stringify(r.pos) + ',');
                field = (field + '}').replace(/\,\}/g,'}');
                fields.push(field);
            }, this)
            ast.body[0].body.expression.properties.forEach(function(p) {
                if(p instanceof uglify.AST_ConciseMethod && p.key.name == 'constructor')
                    for(var b = p.value.body, i = 0; i < b.length; i++) 
                        if(b[i].body instanceof uglify.AST_Assign && b[i].body.left.property == 'dfe') 
                            b[i] = uglify.parse('this.dfe=[' + fields.join(',') + ']');
            });
            var enc = uglify.parse('defineForm("' + obj.name + '", ["' + cc.join('", "') + '"], function (' + dp + ') { return ' + ast.print_to_string({ quote_style: 3, beautify: true, comments: true }) + '})');
            return enc.print_to_string({ quote_style: 3, beautify: true, comments: true }); //, ie8: true
        }
        pushCSStoPage(css_text, id) {
            var doc = window.opener ? window.opener.document : document, ui;
            if (!(ui = doc.getElementById(id))) {
                doc.getElementsByTagName('head')[0].innerHTML += '<style id="' + id + '" type="text/css"></style>';
                ui = doc.getElementById(id);
            }
            ui.innerHTML = css_text;
        }
        storeInSession($$) {
            function ajaxPost(data, url, accept, error) {
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: data,
                    dataType: 'json',
                    contentType: "text/plain",
                    success: function(d, s) {
                        typeof accept == 'function' && accept(d, s);
                    },
                    error: function(d, s, e) {
                        typeof error == 'function' ? error(d, s, e) : console.log(e);
                    }
                });
            }
            ajaxPost(this.runtimeToJs($$.data), '/DfeServlet.srv?a=dfe&p=' + $$.data.name, function(d, s) {
                alert(s);
            }, function(xhr, s) {
            	xhr.responseText ? displayServerError(xhr.responseText) : displayServerError(JSON.stringify(xhr));
            });
        }
        getFieldList(proxy, childrenOf, hierarchyOf, subChildren) {
            var arr = proxy.get('dfe');
            if (childrenOf != 0 && childrenOf != 'All') {
                var parent = arr.filter(function(px) {
                    return px.get('.name') == childrenOf;
                })[0];
                return [ parent ].concat(this.getChildrenRecursively(parent, subChildren));
            }
            if (hierarchyOf != 0 && hierarchyOf != 'All') {
                var ret = [], l = proxy.listener, pm = this.nameToPx(proxy);
                for (var px = arr.filter(function(px) {
                    return px.get('.name') == hierarchyOf;
                })[0]; px; px = pm.get(px.get('.parent'))) ret.unshift(px);
                return ret;
            }
            return arr;
        }
        nameToPx($$) {
            var ret = new Map();
            $$.get('dfe').forEach(function(d) {
                ret.set(d.get('.name'), d);
            });
            ret.parent = ret.get($$.get('dfe.parent'));
            return ret;
        }
        rebuildChildren(px) {
            px.append('.children');
            px.data.children = px.get('dfe').map(function(cx) {
                return cx.data;
            }).filter(function(cd) {
                return cd.parent == px.data.name;
            });
        }        
        moveField(proxy, newpos) {
            var idx = proxy.index();
            if (idx != newpos && idx != 0) {
                var data = proxy.get('..').data;
                if (newpos < 1) newpos = 1;
                if (newpos >= data.dfe.length) newpos = data.dfe.length - 1;
                data.dfe.splice(newpos, 0, data.dfe.splice(idx, 1)[0]);
                proxy.listener.notify(data, 'dfe', 'm');
                this.rebuildChildren(this.nameToPx(proxy).parent);
            }
        }
        getContainerLayout(proxy) {
            var par = this.nameToPx(proxy).parent;
            return par && par.get('.component').layout;
        }
        highlightField(e, control) {
            var rt = control.model.runtime && control.model.runtime.target_runtime;
            if (!rt) return;
            var cc, doc = rt.rootControl.ui.ownerDocument, clazz = '__marker__', ui, r, sp, hl = 'background: peru;', body = doc.getElementsByTagName('body')[0], mrk = doc.getElementsByClassName(clazz);
            for (var i = mrk.length; i > 0; i--, mrk[i].parentElement.removeChild(mrk[i])) ;
            var dom = document.elementFromPoint(e.clientX, e.clientY), c, proxy;
            while (dom && !dom._dfe_) dom = dom.parentNode;
            if (dom && (c = dom._dfe_) && typeof (proxy = c.model).get('dfe.name') == 'string') {
                var pm = this.nameToPx(proxy);
                if (e.type == 'mouseover') {
                    do {
                        if (rt.findControls(proxy.get('dfe.name')).filter(function(c) {
                            if ( (c.ui || c.mUI) && (ui = c.ui && c.ui.nodeName ? c.ui : c.mUI[0]).nodeName && (r = ui.getBoundingClientRect()) && (r.x || r.width)) {
                                body.appendChild(sp = doc.createElement('span'));
                                sp.setAttribute('style', 'position: absolute; z-index: 3000; opacity: 0.5; border-radius: 5px; ' + hl);
                                sp.setAttribute('class', '__marker__');
                                sp.style.top = r.top - 3 + (doc.defaultView.scrollY || doc.defaultView.window.pageYOffset) + 'px';
                                sp.style.left = r.left - 4 + (doc.defaultView.scrollX || doc.defaultView.window.pageXOffset) + 'px';
                                sp.style.width = r.width + 10 + 'px';
                                sp.style.height = r.height + 6 + 'px';
                                return true;
                            }
                        }).length > 0) break;
                        hl = 'border: dashed; border-color: red;', proxy = pm.get(proxy.get('dfe.parent'));
                    } while (proxy);
                }
            }
        }
        changeName(px, value) {
            if(px.get('..dfe.name').indexOf(value) != -1) {
                px.listener.notify(px.data, 'name', 'm');
            } else {
                px.set('.name', value);
                px.get('.parent') != 0 && px.listener.notify(this.nameToPx(px).parent.data, 'children');
                px.get('.children').forEach(function(c) { c.set('.parent', value) });
            }
        }
        changeParent(px, newP) {
            if (px) {
                var pm = this.nameToPx(px);
                px.set('.parent', newP);
                this.rebuildChildren(pm.parent);
                this.rebuildChildren(pm.get(newP));
            }
        }
        delete(px) {
            if (px) {
                var oldP = px.get('.parent');
                px.set('.parent');
                this.rebuildChildren(this.nameToPx(px).get(oldP));
                px.detach();
            }
        }
        changePos(px, prop, value) {
            if (px) {
            	var ppx = this.nameToPx(px).parent, spx = px.get('..'); // dfe
            	px.listener.notify(ppx.data, 'children');
            	prop && px.set(prop, value);
            	spx.data.pos = cmn.extend( spx.data.pos, [] );
            }
        }
        changeType(px, value) {
        	var ppx = this.nameToPx(px).parent;
            require(['components/' + value], function(c) {
            	px.set('.component', c);
            	px.get('.parent') != 0 && px.listener.notify(ppx.data, 'children');
            	var pos = [];
            	for(var i = 0; i < c.slots; i++) pos.push({});
            	for(var i = px.data.pos.length, j = c.slots; i > 0 && j > 0; )
            		cmn.extend( px.data.pos[--i] , pos[--j]);
            	px.listener.set(px.data, 'pos', pos);
            	px.set('.pos_idx');
            });
        }
        removeField(proxy) {
            this.changeParent(proxy, undefined);
            proxy.detach();
        }
        getChildrenRecursively(parent, subChildren) {
            var ret = [];
            parent.get('.children').forEach(function(o) {
                ret.push(o);
                if (subChildren == 'Y') ret = ret.concat(this.getChildrenRecursively(o, subChildren));
            }, this);
            return ret;
        }
        validateTarget($$) {
            var tr = $$.runtime.target_runtime, formName = $$.data.name;
            tr.notifyControls(Array.from(tr.controls), 'validate');
            /*require([ 'validation/validator' ], function(validator) {
            	// TODO: maybe inject "validation/component" instead of rendering components to validate "more like server would" 
                var r = validator.validate(tr.model_proxy.data, tr.form);
                alert(r.result ? "Validated" : "Invalid: " + r.data.length + " error(s)");
                tr.notifyControls(tr.findControls(r.data.map(function(v) {
                    return v.field;
                })), 'validate');
            });*/
        }
        loadJS($$, script) {
            var tr = $$.runtime.target_runtime, formName = $$.data.name, t = window.opener || window;
            t.requirejs.undef('forms/' + formName);
            t.eval(script);
            t.require([ 'forms/' + formName ], function(dfe) {
                tr.setDfeForm(dfe).restart();
                $$.runtime.setModel(dfe).restart();
            });
        }
        generateName(proxy) {
            var ns = new Set(proxy.get('dfe.name')), i;
            for (i = ns.size; ns.has('field-' + i); i++) {}
            return 'field-' + i;
        }
        onstart($$) {
        	$$.set('pp_output', this.runtimeToJs($$.data));
        }
        setup(runtime) {
            this.compilationerror = function($$) {
                $$.error('compilation error');
            }
        	var node = (window.opener ? window.opener.document : document).querySelector('div[dfe-edit-target]');
            var tr = node._dfe_runtime;
            cmn.extend({
                launchThrottle: 0,
                target_runtime: tr,
                listener: tr.listener
            }, runtime);
            runtime.setModel(tr.form);
        }
    }
});