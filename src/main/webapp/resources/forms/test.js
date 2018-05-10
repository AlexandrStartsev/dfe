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
        "components/radiolist"], function(Core, shapes, fields, Labeled, Editbox, Container, Table, Button, Checkbox, 
            Text, Dropdown, Html, DivR, TabS, TabD, DivC, Radiolist) {
    let Form = Core.Form;
    
    /*class SubForm extends Form {
        static fields() {
            return ([
                Form.field(Container, "field-2", { get: $$ => $$('.showStuff') == 'Y' ? [] : [$$] }, [
                    Form.field(Editbox, "field-3", {
                        atr: () => fields.simple('.address1', { vstrategy: 'always' })
                    })
                ]),
                Form.field(Checkbox, "field-4", { get: $$ => $$('.showStuff'), set: ($$, value) => $$.set('.showStuff', value) }),
                Form.field(Text, "field-5", { get: function() { 
                    return this.$node.attributes.someProperty;
                }})
            ])
        }
    }
    Form.field(SubForm, "subform", { atr: $$ => ({someProperty: 'someValue#' + $$.index()}) } )
    */
    
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
            return (
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
                ])
            )
        }
    }
    
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
   /* return class TestForm extends Core.Form {
        constructor(node) {
            super(node);
            //console.log(node.unboundModel.data);
        }
        static fields() {
            return Form.field(Table, [
                Form.field(Button, { get: () => 'flip', set: $$ => $$.set('flip', $$('flip') == 'Y' ? 'N' : 'Y' ) }),
                Form.field(Button, { get: () => 'skip', set: $$ => $$.set('skip', $$('skip') == 'Y' ? 'N' : 'Y' ) }),
                Form.field(Table, { 
                    get: $$ => $$('policy.cmau.location.car'),
                    atr: function($$) {
                        let flip = $$('flip') == 'Y' ? -1 : 1;
                        let skip = $$('skip') == 'Y';
                        return { 
                            filter: row => !skip || !(row.data.key % 4),
                            order: (row1, row2) => flip*(row1.data.key - row2.data.key) 
                        }
                    }, 
                    pos: [{newRow: true, colSpan: 2}]
                }, [
                    Form.field(Text, { get: $$ => $$(".key") }),
                    Form.field(Dropdown, "field-1", { 
                        atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                            value: k,
                            description: typeMap[k].name
                        })))
                    }),
                    Form.field(Text, { get: $$ => $$(".vinnumber") }),
                    Form.field(Text, { get: $$ => $$(".TrailerType") }),
                    Form.field(Text, { get: $$ => $$(".make") }),
                    Form.field(Text, { get: $$ => $$(".VehicleClass") }),
                    Form.field(Text, { get: $$ => $$(".StatedAmt") }),
                    Form.field(Text, { get: $$ => $$(".DumpingOpInd") }),
                    Form.field(Text, { get: $$ => $$(".Horsepower") }),
                    Form.field(Text, { get: $$ => $$(".vehicleocostnew") }),
                    Form.field(Text, { get: $$ => $$(".ModelYr") }),
                    Form.field(Text, { get: $$ => $$(".VehUseCd") }),
                    Form.field(Text, { get: $$ => $$(".vinvalid") })
                ])
            ])
        }
    } */
});