define('forms/test',[ "dfe-core",
        "ui/shapes",
        'dfe-field-helper',
        "components/labeled-component", 
        "components/editbox", 
        "components/container", 
        "components/table",
        "components/button",
        "components/checkbox",
        "components/text",
        "components/dropdown",
        "components/html",
        "components/div-r",
        "components/tab-s",
        "components/tab-d",
        "components/div-c",
        "components/radiolist",
        "components/textarea",
       // "components/child-runtime",
        "components/div-button",
        "components/multioption",
        "components/labeled-editbox",
        "components/span",
        "components/inline-rows",
        "components/editbox-popup",         
        "components/modal",
        "components/div-r",
        "components/editbox-code-popup" ], function(Core, shapes, fields, Labeled, Editbox, Container, Table, Button, Checkbox, 
            Text, Dropdown, Html, DivR, TabS, TabD, DivC, Radiolist, Textarea,// ChildRuntime, 
            DivButton, Multioption, LabeledEditbox, Span, InlineRows, EditboxPopup, Modal, Div, EditboxCodePopup ) {
    let Form = Core.Form;
    
    /*return class TestForm extends Core.Form {
        static fields() {
            return [
                //Form.field(Textarea, { get: $$ => $$.get('testCode'), set: ($$, value) => $$.set('testCode', value), atr: () => ({ style: 'width: 200px; height: 100px'}) }),
                Form.field(EditboxCodePopup, "field-3", { 
                    atr: () => fields.simple('testCode', {
                        func: {},
                        ta: {
                            style: 'width: 500px; font-size: 14px; height: 200px; border: 2px solid #aaa; border-radius: 3px',
                            offsetLeft: 10,
                            class: 'popup-editor-wrapper',
                            editorClass: 'edit-popup-textarea'
                        }
                    }) 
                }),
                //Form.field(Textarea, { get: $$ => $$.get('testCode2'), set: ($$, value) => $$.set('testCode2', value), atr: () => ({ style: 'width: 200px; height: 100px'}) }),
                Form.field(EditboxCodePopup, "field-5", { 
                    atr: () => fields.simple('testCode2', {
                        ta: {
                            style: 'width: 500px; font-size: 14px; height: 200px; border: 2px solid #aaa; border-radius: 3px',
                            offsetLeft: 10,
                            class: 'popup-editor-wrapper',
                            editorClass: 'edit-popup-textarea'
                        }
                    }) 
                })
            ]
        }
    }
    
    return class TestForm extends Core.Form {
        static fields() {
            return [
                Form.field(Container, "field-1", [
                    Form.field(Container, "field-2", [
                        Form.field(EditboxCodePopup, "field-3", { 
                            atr: () => fields.simple('.vinnumber', {
                                ta: {
                                    style: 'width: 500px; font-size: 14px; height: 200px; border: 2px solid #aaa; border-radius: 3px',
                                    offsetLeft: 10,
                                    class: 'popup-editor-wrapper',
                                    editorClass: 'edit-popup-textarea'
                                }
                            }) 
                        }),
                    ]),
                    Form.field(Checkbox, "field-4", { get: $$ => $$.get('hideStuff'), set: ($$, value) => $$.set('hideStuff', value) })
                ]),
                Form.field(Modal, {get: $$ => $$.get('hideStuff') == 'Y' ? [] : [$$]}, 
                    Form.field(LabeledEditbox, "f", {
                        atr: () => fields.simple('.vinnumber', { text: "same but labeled: " })
                    })
                )
            ]
        }
    }*/
    
    return class TestForm extends Core.Form {
        static fields() {
            return [
                Form.field(TabS, { get: $$ => $$.get('policy.cmau.location.car'), atr: () => ({ rowstyle$header: 'display: flex'}) }, [
                    Form.field(DivButton, 'header', { get: $$ => 'Car#' + $$.index(2), atr: () => ({ style: 'background: #bbb; border-radius: 2px; display: inline-block; margin: 2px'}) }),
                    Form.field(Editbox, "field-3", {
                        atr: () => fields.simple('.vinnumber', { vstrategy: 'always' })
                    })
                ])
            ]
        }
    }
    
   /* return class TestForm extends Core.Form {
        static fields() {
            return [
                Form.field(TabS, { get: $$ => $$.get('policy.cmau.location'), atr: () => ({ rowstyle$header: 'display: flex'}) }, [
                    Form.field(DivButton, 'header', { get: $$ => 'Location#' + $$.index(), atr: () => ({ style: 'background: #bbb; border-radius: 2px; display: inline-block; margin: 2px'}) }),
                    Form.field(Span, { get: $$ => $$.get('.car') }, [ 
                        Form.field(Container, "field-1", [
                            Form.field(Container, "field-2", { get: $$ => $$.get('hideStuff') == 'Y' ? [] : [$$] }, [
                                Form.field(Editbox, "field-3", {
                                    atr: () => fields.simple('.vinnumber', { vstrategy: 'always' })
                                }),
                            ]),
                            Form.field(Checkbox, "field-4", { get: $$ => $$.get('hideStuff'), set: ($$, value) => $$.set('hideStuff', value) })
                        ])
                    ])
                ])
            ]
        }
        
        
    }*/
    
    let typeMap = {
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
    }
    
    return class TestForm extends Core.Form {
        static fields() {
            return [
                Form.field(TabS, { get: $$ => $$.get('policy.cmau.location'), atr: () => ({ rowstyle$header: 'display: flex', style: 'width: 900px'}) }, [
                    Form.field(DivButton, 'header', { get: $$ => 'Location#' + ($$.index()+1), atr: () => ({ style: 'background: #bbb; border-radius: 2px; display: inline-block; margin: 2px'}) }),
                    Form.field(TabS, { get: $$ => $$.get('.car'), atr: () => ({ rowstyle$header: 'display: flex; width: 900px; flex-flow: wrap;'}) }, [
                        Form.field(DivButton, 'header', { get: $$ => 'Car#' + ($$.index()+1), atr: () => ({ style: 'background: #bbb; border-radius: 2px; display: inline-block; margin: 2px'}) }),
                        Form.field(Table, [
                            Form.field(LabeledEditbox, { atr: () => fields.simple('.vinnumber', { text: 'Vin' }), pos: [{newRow: true}] }),
                            Form.field(Labeled, { atr: () => ({text: 'Vehicle type: '}), pos: [{newRow: true}] },
                                Form.field(Dropdown, { 
                                    atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({ value: k, description: typeMap[k].name })))
                                })
                            ),
                            Form.field(LabeledEditbox, { atr: () => fields.simple('.ModelYr', { text: 'Model Year' }), pos: [{newRow: true}] }),
                            Form.field(LabeledEditbox, { atr: () => fields.simple('.make', { text: 'Make' }), pos: [{newRow: true}] }),
                            Form.field(InlineRows, { get: $$ => $$.get('.vehicletype') === 'car' ? [$$] : [], atr: () => ({singles: true}) }, [
                                Form.field(LabeledEditbox, { atr: () => fields.simple('.StatedAmt', { text: 'Price' }) }),
                                Form.field(LabeledEditbox, { atr: () => fields.simple('.Horsepower', { text: 'HP' }) }),
                                Form.field(LabeledEditbox, { atr: () => fields.simple('.vehicleocostnew', { text: 'Cost new' }) }),
                                Form.field(LabeledEditbox, { atr: () => fields.simple('.VehUseCd', { text: 'Vehicle use' }) })
                            ]),
                            Form.field(InlineRows, { get: $$ => $$.get('.vehicletype') === 'truck' ? [$$] : [], atr: () => ({singles: true}) }, [
                                Form.field(LabeledEditbox, { atr: () => fields.simple('.VehicleClass', { text: 'Class' }) }),
                                Form.field(LabeledEditbox, { atr: () => fields.simple('.TrailerType', { text: 'Trailer type' }) }),
                                Form.field(LabeledEditbox, { atr: () => fields.simple('.DumpingOpInd', { text: 'Dumping opt' }) })
                            ])
                        ])
                    ])
                ])
            ]
        }
    }
    
    class SubForm extends Form {
        static fields() {
            return ([
                Form.field(Container, "field-2", { get: $$ => $$.get('hideStuff') == 'Y' ? [] : [$$] }, [
                    Form.field(Editbox, "field-3", {
                        atr: () => fields.simple('.ModelYr', { vstrategy: 'always' })
                    }),
                    Form.field(LabeledEditbox, "f", { 
                        atr: () => fields.simple('.ModelYr', { vstrategy: 'always', text: "same but labeled: " })
                    }) 
                ]),
                Form.field(Checkbox, "field-4", { get: $$ => $$.get('hideStuff'), set: ($$, value) => $$.set('hideStuff', value) }),
                Form.field(Text, "field-5", { 
                    get: function() { 
                        return this.$node.attributes.someProperty;
                    }, atr: () => ({ 
                        attributeMapper: attributes => ({
                            ...attributes, 
                            ref: element => element.setAttribute('style', 'background: yellow') 
                        }) 
                    })
                })
            ])
        }
    }
    

    return class TestForm extends Core.Form {
        static fields() {
            return [
                Form.field(DivC, { get: $$ => $$.get('policy.cmau.location.car'), atr: () => ({style: 'display: flex'})}, [
                    Form.field(Text, 'h1', { get: () => 'Vin number', class: 'header' }),
                    Form.field(Text, 'h2', { get: () => 'Type', class: 'header' }),
                    Form.field(Text, 'h3', { get: () => 'Has vin', class: 'header' }),
                    Form.field(Text, 'h4', { get: () => 'Has vin', class: 'header' }),
                    Form.field(Text, 'r1', { get: $$ => ($$.get('.hasvin') == 'Y' ? '' : '*') + $$.get('.vinnumber') }),
                    Form.field(Dropdown, 'r2', {
                        atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                            value: k,
                            description: typeMap[k].name
                        })))
                    }),
                    Form.field(Radiolist, 'r3', { atr: () => fields.simple('.hasvin') }),
                    Form.field(Multioption, { get: $$ => ({value: $$.get('.hasvin'), options: ['Y', 'N']}), set: ($$, value) => $$.set('.hasvin', value) })
                ]),
                Form.field(TabS, { get: $$ => $$.get('policy.cmau.location'), atr: () => ({ rowstyle$header: 'display: flex'}) }, [
                    Form.field(DivButton, 'header', { get: $$ => 'Location#' + $$.index(), atr: () => ({ style: 'background: #bbb; border-radius: 2px; display: inline-block; margin: 2px'}) }),
                    Form.field(Table, { get: $$ => $$.get('.car') },  
                        Form.field(TabD, 'tab-fld', { 
                            get: () => [{caption: 'This is VIN', hfield: 'h1'}, {caption: 'This is type', hfield: 'h2'}], 
                            set: ($$, px) => $$.set('.activeTab', px.get('.hfield')),
                            atr: $$ => ({
                                activeTab: function(px) {
                                    let at = $$.get('.activeTab').toString() || 'h1';
                                    return px ? px.get('.hfield') == at : at;
                                }
                            }) 
                        }, [
                            Form.field(Text, 'hRow', { get: $$ => $$.get('.caption') }),
                            Form.field(Text, 'h1', { get: $$ => $$.get('.vinnumber'), class: 'header' }),
                            Form.field(Dropdown, 'h2', {
                                atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                                    value: k,
                                    description: typeMap[k].name
                                }))),
                                class: 'header'
                            })
                        ]),
                        Form.field(SubForm, "subform", { atr: $$ => ({someProperty: 'someValue#' + $$.index()}), pos: [{newRow: true}] }),
                        Form.field(DivButton, { get: () => 'Click me', set: () => alert('merci') }),
                        //Form.field(ChildRuntime, "subruntime", { atr: () => ({ form: 'forms/test2'}), pos: [{newRow: true}] } )
                    )
                ])
            ]
        }
    }
    /*
    return class TestForm extends Core.Form {
        static fields() {
            return (
                Form.field(Table, { get: $$ => $$.get('policy.cmau.location.car') }, [
                    Form.field(TabD, 'tab-fld', { 
                        get: () => [{caption: 'This is VIN', hfield: 'h1'}, {caption: 'This is type', hfield: 'h2'}], 
                        set: ($$, px) => $$.set('.activeTab', px.get('.hfield')),
                        atr: $$ => ({
                            activeTab: function(px) {
                                let at = $$.get('.activeTab').toString() || 'h1';
                                return px ? px.get('.hfield') == at : at;
                            }
                        }) 
                    }, [
                        Form.field(Text, 'hRow', { get: $$ => $$.get('.caption') }),
                        Form.field(Text, 'h1', { get: $$ => $$.get('.vinnumber'), class: 'header' }),
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
                Form.field(TabS, 'tab-fld', { get: $$ => $$.get('policy.cmau.location.car'), atr: () => ({headField: 'hd-fld', haclass: "me-active"}) }, [
                    Form.field(Text, 'hd-fld', { get: $$ => $$.get('.vinnumber') }),
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
                Form.field(Table, { get: $$ => $$.get('policy.cmau.location.car') }, [
                    Form.field(Html, "field-49", {
                        get: $$ => shapes.cssShape($$, $$.get('.hasvin') == 'Y' ? 'css-button-plus' : 'css-button-minus'),
                        atr: $$ => ({
                            events: {
                                onClick: () => $$.set('.hasvin', $$.get('.hasvin') == 'Y' ? 'N' : 'Y')
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
                                    vehicleType: $$.get('.vehicletype'),
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
    return class TestForm extends Core.Form {
        constructor(node) {
            super(node);
            //console.log(node.unboundModel.data);
        }
        static fields() {
            return Form.field(Table, [
                Form.field(Button, { get: () => 'flip', set: $$ => $$.set('flip', $$.get('flip') == 'Y' ? 'N' : 'Y' ) }),
                Form.field(Button, { get: () => 'skip', set: $$ => $$.set('skip', $$.get('skip') == 'Y' ? 'N' : 'Y' ) }),
                Form.field(Button, { get: () => 'append', set: $$ => $$.get('policy.cmau.location').pop().append('.car', {vinnumber: 'New'}) }),
                Form.field(Table, { 
                    get: $$ => $$.get('policy.cmau.location.car'),
                    atr: function($$) {
                        let flip = $$.get('flip') == 'Y' ? -1 : 1;
                        let skip = $$.get('skip') == 'Y';
                        return { 
                            filter: row => !skip || !(row.data.key % 4),
                            order: (row1, row2) => flip*(row1.data.key - row2.data.key) 
                        }
                    }, 
                    pos: [{newRow: true, colSpan: 3}]
                }, [
                    Form.field(Text, { get: $$ => $$.get(".key") }),
                    Form.field(Dropdown, "field-1", { 
                        atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                            value: k,
                            description: typeMap[k].name
                        })))
                    }),
                    Form.field(Text, { get: $$ => $$.get(".vinnumber") }),
                    Form.field(Text, { get: $$ => $$.get(".TrailerType") }),
                    Form.field(Text, { get: $$ => $$.get(".make") }),
                    Form.field(Text, { get: $$ => $$.get(".VehicleClass") }),
                    Form.field(Text, { get: $$ => $$.get(".StatedAmt") }),
                    Form.field(Text, { get: $$ => $$.get(".DumpingOpInd") }),
                    Form.field(Text, { get: $$ => $$.get(".Horsepower") }),
                    Form.field(Text, { get: $$ => $$.get(".vehicleocostnew") }),
                    Form.field(Text, { get: $$ => $$.get(".ModelYr") }),
                    Form.field(Text, { get: $$ => $$.get(".VehUseCd") }),
                    Form.field(Text, { get: $$ => $$.get(".vinvalid") }),
                    Form.field(Button, { get: () => 'Delete', set: $$ => $$.detach() })
                ])
            ])
        }
    } 
});

define('forms/test2',[ "dfe-core",
        "ui/shapes",
        'dfe-field-helper',
        "components/labeled", 
        "components/editbox",
        "components/container",
        "components/checkbox",
        "components/table"], function(Core, shapes, fields, Labeled, Editbox, Container, Checkbox, Table) {
    let Form = Core.Form;
    
    return class SubForm2 extends Form {
        static fields() {
            return ([
                Form.field(Table, [
                    Form.field(Container, "field-2", { 
                        get: $$ => $$.get('.hideStuff') == 'Y' ? [] : [$$] 
                    }, [
                        Form.field(Editbox, "field-3", {
                            atr: () => fields.simple('.ModelYr', { vstrategy: 'always' })
                        })
                    ]),
                    Form.field(Checkbox, "field-4", { get: $$ => $$.get('.hideStuff'), set: ($$, value) => $$.set('.hideStuff', value) })
                ])
            ])
        }
    }  
})