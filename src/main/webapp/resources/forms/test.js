define([ "dfe-core",
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
        "components/tab-s" ], function(Core, shapes, fields, Labeled, Editbox, Container, Table, Button, Checkbox, 
            Text, Dropdown, Html, DivR, TabS) {
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
    }
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
});