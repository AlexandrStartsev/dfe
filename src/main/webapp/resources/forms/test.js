define([ "dfe-core", 
        'dfe-field-helper',
        "components/labeled-component", 
        "components/editbox", 
        "components/container", 
        "components/table",
        "components/button",
        "components/checkbox",
        "components/text",
        "components/dropdown" ], function(Core, fields, Labeled, Editbox, Container, Table, Button, Checkbox, Text, Dropdown) {
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
                Form.field(Table, { get: $$ => $$('policy.cmau.location.car') }, [
                    Form.field(Dropdown, "field-1", { 
                        atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                            value: k,
                            description: typeMap[k].name
                        })))
                    }),
                    Form.field(Dropdown, "field-2", { 
                        val: $$ => $$.required('.ModelYr', '(18|19|20)\\d{2}'),
                        atr: $$ => fields.ajaxChoice('.ModelYr', {
                            query: {
                                vehicleType: $$('.vehicletype'),
                                method: 'CMAUVehicleScriptHelper',
                                action: 'getYearOptions'
                            }
                        })
                    })
                ])
            )
        }
    }
});