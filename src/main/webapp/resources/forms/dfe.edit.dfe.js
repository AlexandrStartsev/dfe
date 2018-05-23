define([ "dfe-core", "require", "uglify", "babel", "dfe-common", "components/button", "components/label", "components/dropdown", "components/checkbox", "components/editbox-code-popup", "components/editbox", "components/div-button", "components/div", "components/div-c", "components/div-r", "components/generic", "ui/jquery" ], function(Core, require, uglify, babel, cmn, Button, Label, Dropdown, Checkbox, EditboxCodePopup, Editbox, DivButton, Div, DivC, DivR, generic, jQuery) {
    let Form = Core.Form;
    let compilationError = $$ => $$.error('compilation error');
    
    let targetRuntime, targetFormClass, targetDocument, targetWindow, formModuleName, formScript;
    
    return class Editor extends Form {
        constructor(node) {
            super(node);
            
            if(formScript === undefined) {
                // TODO: use target's window/document
                let defined = window.require.s.contexts._.defined;
                formModuleName = Object.keys(defined).filter(prop => defined[prop] === node.unboundModel.get('.component')).shift();
                let origins = document.querySelector('script[data-requiremodule="' + formModuleName + '"]').src;
                jQuery.get(origins, script => {
                    this.parseScript(script);
                    node.unboundModel.set({formScript: formScript});
                }, "text");
            } else {
                this.parseScript(formScript);
                node.unboundModel.set({formScript: formScript});
            }
            
            Editor.allFields(node.unboundModel).forEach(
                px => ['.get', '.set', '.val', '.atr'].forEach(
                    prop => px.set(prop + '_text', Editor.codeToText(px.get(prop)))
                )
            )
        }
        static fields(_, config) {
            targetRuntime = config.targetRuntime;
            targetFormClass = targetRuntime.formClass;
            targetDocument = targetRuntime.nodes[0].$parentDom.ownerDocument;
            targetWindow = targetDocument.defaultView;
            
            return Form.field(DivR,"root", {
                atr: () => ({
                    class: 'div-flex',
                    rowclass: 'div-flex-row',
                    rowstyle: 'margin-top: 2px; overflow: hidden; border: 1px solid; border-color: darkgray; border-radius: 5px; width: min-content; width: -moz-min-content;',
                    rowstyle$header: 'display: table',
                    rowclass$footer: 'div-flex-row',
                    rowstyle$footer: 'flex-wrap: wrap; width: 800px;'
                })
            }, [ Form.field(Button, "add_dfe", {
                class: "header",
                get: () => '+',
                set: function($$, value) {
                    let targetCore = targetWindow.eval('require("dfe-core")');
                    let targetEditbox = targetWindow.eval('require("components/editbox")'), taken = [], pattern = targetEditbox.name + '#';
                    let co = $$.get('childrenOf'), ppx = Editor.allFields($$).filter(
                        px => {
                            let name = px.get('.name');
                            name.match(pattern) && taken.push(name);
                            return co == 0 || name == co
                        }
                    ).shift();
                    let index = 1;
                    while(taken.indexOf(pattern + index) !== -1) index++;
                    ppx.append('.children', targetCore.Form.field(targetEditbox, pattern + index), true);
                    targetRuntime.nodes.forEach(node => node.field.key === ppx.key && node.notify());
                },
                layout: [ { style: "display: inline; height: min-content;" } ]
            }), Form.field(Label, "l1", {
                class: "header",
                get: () => 'Show only children of: ',
                layout: [ {
                    style: "display: inline; margin-left: 2px; "
                } ]
            }), Form.field(Dropdown, "childrenOf", {
                class: "header",
                get: $$ => ({ value: $$.get('childrenOf'),
                        items: [ {
                            value: [],
                            description: 'All'
                        } ].concat(Editor.allFields($$).filter(function(px) {
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
                layout: [ {
                    style: "display: inline; margin-left: 2px; "
                } ]
            }), Form.field(Checkbox, "subChildren", {
                class: "header",
                get: $$ => ({
                        checked: $$.get('subChildren'),
                        text: ''
                    }),
                set: ($$, value) => $$.set('subChildren', value),
                atr: () => ({ style: 'display: inline' }),
                layout: [ {
                    style: "display: inline; margin-left: 2px; "
                } ]
            }), Form.field(Label, "l2", {
                class: "header",
                get: () => 'Show hierarchy: ',
                layout: [ {
                    style: "display: inline; margin-left: 2px; "
                } ]
            }), Form.field(Dropdown, "hierarchyOf", {
                class: "header",
                get: $$ => ({
                        value: $$.get('hierarchyOf'),
                        items: [ { value: [], description: 'All' } ].concat(Editor.allFields($$).map(px => px.get('.name')).sort())
                    }),
                set: ($$, value) => $$.set({ childrenOf: [], hierarchyOf: value }),
                layout: [ {
                    style: "display: inline; margin-left: 2px; "
                } ]
            }), Form.field(Button, "JS", {
                class: "header",
                get: () => 'to JS',
                set: function($$) {
                    let fields = this.fieldsToText($$);
                    let returnStatement = uglify.parse('function f(){return'+fields+'}').body[0].body[0];
                    let i, body = this.ast.fieldsDeclBody;
                    for(i = 0; i < body.length && !(body[i] instanceof uglify.AST_Return); i ++ ) ;
                    body[i] = returnStatement;
                    $$.set('formScript', this.ast.ast.print_to_string({
                        quote_style: 3,
                        beautify: true,
                        comments: true
                    }))
                }, 
                layout: [ {
                    style: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), Form.field(Button, "load - js", {
                class: "header",
                get: () => 'from JS',
                set: function($$) { this.restartWithNewScript($$.get('formScript')) },
                layout: [ {
                    style: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), Form.field(EditboxCodePopup, {
                class: "header",
                get: $$ => $$.get('formScript'),
                set: ($$, value) => $$.set('formScript', value),
                atr: () => ({
                        class: 'focus-front',
                        trigger: 'change',
                        style: 'width: 100px;',
                        ta: {
                            style: 'width: 1070px; font-size: 14px; height: 400px;',
                            offsetLeft: -500,
                            class: 'popup-editor-wrapper',
                            editorClass: 'edit-popup-textarea',
                            errorClass: ''
                        }
                    }),
                layout: [ {
                    style: "display: inline; margin-left: 2px; "
                } ]
            }), Form.field(Button, "validate", {
                class: "header",
                get: () => 'Simulate validation',
                set: $$ => targetRuntime.nodes.forEach(node => node.notify({action: 'validate'})),
                layout: [ {
                    style: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), Form.field(Button, "restart", {
                class: "header",
                get: () => 'Restart target',
                set: () => targetRuntime.restart(),
                layout: [ {
                    style: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), Form.field(Button, "push2srv", {
                class: "header",
                get: () => 'Store in session',
                set: () => alert('Implement me'),
                layout: [ {
                    style: "display: inline; margin-left: 2px; height: min-content;"
                } ]
            }), Form.field(DivC, "dfe_row", {
                get: $$ => Editor.allFields($$),
                atr: function($$) {
                    let nameToField = new Map();
                    Editor.allFields($$).forEach(d => nameToField.set(d.get('.name'), d));
                    return {
                        filter: Editor.filterRow.bind(null, $$.get('childrenOf'), $$.get('hierarchyOf'), $$.get('subChildren'), nameToField),
                        class: 'div-flex-h',
                        style: 'box-sizing: border-box; overflow-y: scroll; height: 400px;',
                        rowclass$header: 'div-alt-color-fc',
                        orientation: 'horizontal',
                        events: {
                            onMouseOver: this.highlightField.bind(this),
                            onMouseLeave: this.highlightField.bind(this)
                        }
                    };
                },
                layout: [ {
                    class: "div-flex-col",
                    style: "margin: 0px; padding: 0px; width: max-content; width: -moz-max-content;"
                } ]
            }, [ Form.field(Label, "up_field_h", {
                class: "header",
                get: () => '#',
                layout: [ {
                    class: "div-flex-col sticky-header",
                    style: "border-top-left-radius: 3px;"
                } ]
            }), Form.field(Label, "name_field_h", {
                class: "header",
                get: () => 'Field name',
                layout: [ {
                    class: "div-flex-col sticky-header"
                } ]
            }), Form.field(Label, "parent_field_h", {
                class: "header",
                get: () => 'Parent',
                layout: [ {
                    class: "div-flex-col sticky-header"
                } ]
            }), Form.field(Label, "type_field_h", {
                class: "header",
                get: () => 'Type',
                layout: [ {
                    class: "div-flex-col sticky-header"
                } ]
            }), Form.field(Label, "get_field_h", {
                class: "header",
                get: () => 'Getter',
                layout: [ {
                    class: "div-flex-col sticky-header"
                } ]
            }), Form.field(Label, "set_field_h", {
                class: "header",
                get: () => 'Setter',
                layout: [ {
                    class: "div-flex-col sticky-header"
                } ]
            }), Form.field(Label, "val_field_h", {
                class: "header",
                get: () => 'Validation',
                layout: [ {
                    class: "div-flex-col sticky-header"
                } ]
            }), Form.field(Label, "attr_field_h", {
                class: "header",
                get: () => 'Attributes',
                layout: [ {
                    class: "div-flex-col sticky-header"
                } ]
            }), Form.field(Label, "del_field_h", {
                class: "header",
                get: () => 'Del.',
                layout: [ {
                    class: "div-flex-col sticky-header",
                    style: "margin-bottom: 0px;"
                } ]
            }), Form.field(Label, "class_field_h", {
                class: "header",
                get: () => 'Class',
                layout: [ {
                    class: "div-flex-col sticky-header",
                    style: "margin-bottom: 0px;"
                } ]
            }), Form.field(Label, "ppos_field_h", {
                class: "header",
                get: () => 'Layout',
                atr: () => ({
                        style: 'white-space: nowrap;'
                    }),
                layout: [ {
                    class: "div-flex-col sticky-header"
                } ]
            }), 
                Form.field(Editbox, "field_index", {
                get: $$ => $$.index().toString(),
                set: function($$, newIndex){
                    newIndex = +newIndex;
                    if(isNaN(newIndex) || newIndex < 0) {
                        $$.$node.notify();
                    } else {
                        let all = $$.get('..').data.children, currentIndex = $$.index();
                        if( newIndex >= all.length ) {
                            newIndex = all.length - 1;
                        }
                        all.splice(newIndex, 0, all.splice(currentIndex, 1)[0]);
                        $$.get('..').append('.children').pop().detach();
                        Editor.resetField($$.get('..').key); 
                    }
                },
                atr: $$ => ({
                    trigger: 'change',
                    style: $$.get('..name') == 0 ? 'visibility:hidden;' : '',
                    class: 'editor-pos-fld'
                }),
                layout: [ {
                    class: "div-flex-col editbox-col --hover-visible"
                } ]
            }), Form.field(Editbox, "name_field", {
                get: $$ => $$.get('.name'),
                set: function($$, value){
                    if(value == 0 || Editor.allFields($$).filter(px => px.get('.name') == value) != 0) {
                        $$.$node.notify();
                    } else {
                        $$.set('.name', value);
                        Editor.resetField($$.key); 
                    }
                }, 
                atr: () => ({ trigger: 'change', style: 'width: 120px;'}),
                layout: [ {
                    class: "div-flex-col"
                } ]
            }), Form.field(Dropdown, "parent_field", {
                get: $$ => ({
                    value: $$.get('..key'),
                    items: Editor.allFields($$).filter(px => px.get('.name') != $$.get('.name')).map(
                        px => ({ value: px.key, description: px.get('.name').toString() })
                    ).sort((v1, v2) => v1.description < v2.description ? -1 : 1 )
                }),
                set: function($$, key) {
                    let node = targetRuntime.nodes.filter(node => node.field.key === $$.key).shift();
                    Editor.allFields($$).filter(px => px.key === key).shift().append('.children', $$, true);
                    Editor.resetField(node.parent.field.key, true);
                    Editor.resetField(key, true);
                    let myRuntime = $$.$node.runtime;
                    myRuntime.nodes.filter(node => node.model.key === $$.key).forEach(node => {
                        node.parent.notify();
                        myRuntime.evict(node);
                    })
                },
                atr: $$ => ({ style: $$.get('..name') == 0 ? 'visibility:hidden;' : 'width: 100%;' }),
                layout: [ {
                    class: "div-flex-col"
                } ]
            }), Form.field(Dropdown, "type_field", {
                get: $$ => ({
                    value: $$.get('.component'),
                    items: [{
                        value: Core.Component, 
                        description: 'Base/Unknown'
                    }].concat(Object.keys(generic).map(
                        key => ({value: generic[key], description: key})
                    ))
                }),
                set: function($$, value){
                    $$.set('.component', value);
                    Editor.resetField($$.key);
                }, 
                layout: [ {
                    class: "div-flex-col editbox-col"
                } ]
            }), Form.field(EditboxCodePopup, "get_field", {
                get: $$ => $$.get('.get_text'),
                set: function($$, value) {
                    $$.set({get_text: value, get: this.textToCode(value)});
                    targetRuntime.nodes.forEach(node => node.field.key === $$.key && node.notify());
                },
                val: $$ => $$.get('.get') == compilationError && $$.error('Compilation error'),
                atr: () => ({
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        errorClass: 'editbox-error',
                        ta: {
                            offsetLeft: -100,
                            class: 'popup-editor-wrapper',
                            editorClass: 'edit-popup-textarea',
                            errorClass: 'popup-code-editor-erroring'
                        }
                    }),
                layout: [ {
                    class: "div-flex-col"
                } ]
            }), Form.field(EditboxCodePopup, "set_field", {
                get: $$ => $$.get('.set_text'),
                set: function($$, value) {
                    $$.set({set_text: value, set: this.textToCode(value)});
                },
                val: $$ => $$.get('.set') == compilationError && $$.error('Compilation error'),
                atr: () => ({
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        errorClass: 'editbox-error',
                        ta: {
                            offsetLeft: -100,
                            class: 'popup-editor-wrapper',
                            editorClass: 'edit-popup-textarea',
                            errorClass: 'popup-code-editor-erroring'
                        }
                    }),
                layout: [ { class: "div-flex-col" } ]
            }), Form.field(EditboxCodePopup, "val_field", {
                get: $$ => $$.get('.val_text'),
                set: function($$, value) {
                    $$.set({val_text: value, val: this.textToCode(value)});
                    targetRuntime.nodes.forEach(node => node.field.key === $$.key && node.notify());
                },
                val: $$ => $$.get('.val') == compilationError && $$.error('Compilation error'),
                atr: () => ({
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        errorClass: 'editbox-error',
                        ta: {
                            offsetLeft: -100,
                            class: 'popup-editor-wrapper',
                            editorClass: 'edit-popup-textarea',
                            errorClass: 'popup-code-editor-erroring'
                        }
                    }),
                layout: [ { class: "div-flex-col" } ]
            }), Form.field(EditboxCodePopup, "attr_field", {
                get: $$ => $$.get('.atr_text'),
                set: function($$, value) {
                    $$.set({atr_text: value, atr: this.textToCode(value)});
                    targetRuntime.nodes.forEach(node => node.field.key === $$.key && node.notify());
                },
                val: $$ => $$.get('.atr') == compilationError && $$.error('Compilation error'),
                atr: () => ({
                        style: 'margin: 0px',
                        spellcheck: 'false',
                        vstrategy: 'always',
                        errorClass: 'editbox-error',
                        ta: {
                            offsetLeft: -100,
                            class: 'popup-editor-wrapper',
                            editorClass: 'edit-popup-textarea',
                            errorClass: 'popup-code-editor-erroring'
                        }
                    }),
                layout: [ { class: "div-flex-col" } ]
            }), Form.field(DivButton, "field_del", {
                get: $$ => 'X',
                set: function($$) {
                    Editor.resetField($$.key);
                    $$.detach();
                },
                atr: $$ => ({
                    class: 'div-button',
                    style: 'padding: 2px 5px; min-height: initial;' + ($$.get('..component') == 0 ? 'visibility:hidden;' : '')
                }),
                layout: [ { class: "div-flex-col editbox-col", style: "padding: 0px; margin: 0px" } ]
            }), Form.field(Dropdown, "class_field", {
                get: $$ => ({
                        value: $$.get('.class'),
                        items: [ '', 'header', 'footer' ]
                    }),
                set: function($$, value) {
                    $$.set('.class', value);
                    $$.listener.notify($$.get('..').data, 'children');
                },
                atr: $$ => ({
                        style: $$.get('..component') == 0 ? 'visibility:hidden;' : ''
                    }),
                layout: [ {
                    class: "div-flex-col editbox-col"
                } ]
            }), Form.field(EditboxCodePopup, "layout_spec_ctrl", {
                get: $$ => JSON.stringify($$.listener.get($$.data, 'layout')||[]),
                set: function($$, value) {
                    console.warn('TODO');
                }, 
                atr: () => ({
                    style: 'margin: 0px',
                    trigger: 'change',
                    spellcheck: 'false',
                    errorClass: 'editbox-error',
                    ta: {
                        offsetLeft: -300,
                        class: 'popup-editor-wrapper',
                        editorClass: 'edit-popup-textarea',
                        errorClass: 'popup-code-editor-erroring'
                    }
                }),
                layout: [ { class: "div-flex-col" } ]
            }) ]) ])
        }
        static resetField(fieldKey, resetChildren) {
            targetRuntime.nodes.filter(node => node.field.key === fieldKey || node.field.name === fieldKey).forEach(node => {
                let targetNode = resetChildren ? node : node.parent;
                if(targetNode) {
                    targetNode.children.forEach(map => map.forEach(child => targetRuntime.evict(child)));
                    targetNode.notify();
                }
            })
        }
        static allFields($$) {
            let tr = model => model.get('.children').reduce( (out, field) => out.concat(tr(field)), [model])
            return [].concat.apply([], $$.get('children').map(tr));
        }
        static codeToText(fn) {
            return fn.toString().replace(/^function[^(]*/, 'function').replace(/\n\/\*``\*\//, '');
        }
        static filterRow(childrenOf, hierarchyOf, subChildren, ntp, row) {
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
        static getContainerLayout(proxy) {
            return proxy.get('..component') == generic.Table ? 'tpos' : 'dpos'; //return proxy.get('..component').layout;
        }
        highlightField(event) {
            let my = Core.nodeFromElement( event.target );
            let doc = targetRuntime.nodes[0].$parentDom.ownerDocument;
            for(let old = doc.getElementsByClassName('__marker__'), i = old.length-1; i >= 0; i--) {
                doc.body.removeChild(old[i]);
            }
            if(my && my.model) {
                let fieldKey = my.model.key, style = 'background: peru;';
                let nodes = targetRuntime.nodes.filter(node => node.field.key === fieldKey && node !== targetRuntime.nodes[0]);
                while(nodes.length && !nodes.some(node => node.isAttached())) {
                    nodes = nodes.map(node => node.parent).filter(node => node);
                    style = 'border: dashed; border-color: red;';
                }
                let uniq = new Set();
                nodes.filter(node => node.isAttached()).forEach(node => uniq.add(node));
                
                uniq.forEach(
                    node => {
                        let content = Core.getDOMContent(node);
                        content.filter( node => content.indexOf(node.parentNode) === -1 ).forEach(
                            dom => {
                                let r = (dom.getBoundingClientRect ? dom : dom.parentNode).getBoundingClientRect(), sp;
                                if(r && (r.x || r.width)){
                                    doc.body.appendChild(sp = doc.createElement('span'));
                                    sp.setAttribute('style', 'position: absolute; z-index: 3000; opacity: 0.5; border-radius: 5px; ' + style);
                                    sp.setAttribute('class', '__marker__');
                                    sp.style.top = r.top - 3 + (doc.defaultView.scrollY || doc.defaultView.window.pageYOffset) + 'px';
                                    sp.style.left = r.left - 4 + (doc.defaultView.scrollX || doc.defaultView.window.pageXOffset) + 'px';
                                    sp.style.width = r.width + 10 + 'px';
                                    sp.style.height = r.height + 6 + 'px';
                                }
                            }
                        )
                    }
                )
            }
        }
        parseScript(script) {
            let ast = uglify.parse(script);
            ast.body = ast.body.filter(
                item => item.body instanceof uglify.AST_Call && item.body.expression.name === 'define' &&
                (!(item.body.args[0] instanceof uglify.AST_String) || 
                   item.body.args[0] instanceof uglify.AST_String && item.body.args[0].value === formModuleName  )
            );
            let defineStatement = ast.body[0].body;
            formScript = script.substr(defineStatement.start.pos, defineStatement.end.endpos);
            let defineFunc = defineStatement.args[defineStatement.args.length-1];
            let defineScope = (
                defineStatement.args.reduce(
                    (ret, cur) => ret || cur instanceof uglify.AST_Array && cur, null
                )||{elements:[]}
            ).elements.map( (ast, i) => defineFunc.argnames[i].name  + '=this.require("' + ast.value + '")' ).join();
            let classDecl = {}, targetClassDecl = null;
            let returnStatement = defineFunc.body.reduce(
                (ret, cur) => {
                    if(!ret) {
                        if(cur instanceof uglify.AST_Return) {
                            if(cur.value instanceof uglify.AST_ClassExpression ) {
                                targetClassDecl = cur.value;
                            } else {
                                if(cur.value instanceof uglify.AST_SymbolRef ) {
                                    targetClassDecl = classDecl[cur.value.name];
                                } else {
                                    throw 'Unrecognized construction';
                                }
                            }
                            ret = cur;
                        }
                        if(cur instanceof uglify.AST_DefClass || cur instanceof uglify.AST_ClassExpression) {
                            classDecl[cur.name.name] = cur;
                        }
                        if( cur instanceof uglify.AST_Let || cur instanceof uglify.AST_Var ) {
                            cur.definitions.forEach(def => def.value instanceof uglify.AST_ClassExpression && (classDecl[def.name.name] = def.value));
                        }
                    }
                    return ret; 
                },
                null
            );
            let fieldsDecl = targetClassDecl.properties.filter(prop => prop instanceof uglify.AST_ConciseMethod && prop.key.name === 'fields').shift();
            this.ast = {
                ast: ast,
                defineScope: defineScope,
                targetClassDecl: targetClassDecl,
                fieldsDeclBody: fieldsDecl.value.body // decl.value.print_to_string = function(){return[Form.field(...   - AST_Accessor 
            }
        }
        restartWithNewScript(script) {
            formScript = script;
            let defScript = script.replace(/^[\t\n ]*define *\([\t\n ]*([^'"])/,'define("' + formModuleName + '",$1');
            let myRuntime = this.$node.runtime;
            targetWindow.require.undef(formModuleName);
            targetWindow.eval(defScript);
            targetWindow.require([formModuleName], formClass => {
                targetRuntime.setDfeForm(formClass).restart();
                myRuntime.setModel(targetRuntime.nodes[0].field).restart();
            })
        }
        fieldsToText($$) {
            function stringify(value) {
                switch(typeof value) {
                    case 'function':
                        return value.toString();
                    case 'object':
                        throw 'TODO'
                    default:
                        return JSON.stringify(value);
                }
            }
            let tr = data => {
                let {key, name, component, children, ...rest} = data;
                let chldrn = children.map(tr).join();
                let str = 'Form.field(' + component.name;
                let props = Object.getOwnPropertyNames(rest).filter(prop => !prop.match(/_text/)).map(
                    prop => prop + ':' + stringify(rest[prop])
                ).join();
                name.match(/#\d+/) || (str += ',"' + name + '"');
                props && (str += ',{' + props + '}');
                chldrn && (str += ',' + (children.length > 1 ? '[' + chldrn + ']' : chldrn ));
                str += ')';
                return str;
            }
            return '[' + [].concat.apply([], $$.get('children').map(px => px.data).map(tr)).join() + ']';
        }
        textToCode(code) {
            try {
                return new Function(targetFormClass.name, "var " + this.ast.defineScope + "; return " + code).call(targetWindow, targetFormClass);
            } catch(e) {
                console.error('Compilation error [' + e.message + '] for:\n' + code);
                return compilationError;
            }
        }
        /*
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
        changePos(px, prop, value) {
            if (px) {
                var fpx = px.get('..');
                px.listener.notify(fpx.get('..').data, 'children');
                prop && px.set(prop, value);
                fpx.data.pos = cmn.extend(fpx.data.pos, []);
            }
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
            for (var n = Editor.allFields(px).map(function(p) {
                return p.get('.name');
            }), i = 1; n.indexOf('field-' + i) != -1; i++) ;
            return 'field-' + i;
        }
        */
    }
})