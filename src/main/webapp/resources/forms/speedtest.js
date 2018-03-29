defineForm("speedtest", [ "dfe-field-helper", "components/label", "components/editbox", "components/button", "components/div" ], function(fields, __c_label, __c_editbox, __c_button, __c_div) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => [ $$ ]
            }, [ __c_div("field-1", {
                get: $$ => $$('policy.cmau.location')
            }, [ __c_label("field-2", {
                get: $$ => 'Location#' + $$.index()
            }), __c_div("field-3", {
                get: $$ => $$('.car')
            }, [ __c_editbox("field-4", {
                atr: $$ => fields.simple('.make', [])
            }), __c_button("field-5", {
                get: $$ => 'Apply to all',
                set: $$ => {
                    let make = $$('.make');
                    $$('...location.car').forEach(car => car.set('.make', make));
                },
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }), __c_label("field-6", {
                get: $$ => 'Just text',
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }), __c_label("field-7", {
                get: $$ => $$('.VehicleClass'),
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }), __c_label("field-8", {
                get: $$ => $$('.SecondaryClassType'),
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }), __c_label("field-9", {
                get: $$ => $$('.VehUseCd'),
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }), __c_label("field-10", {
                get: $$ => $$('.UseClassInd1'),
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }), __c_label("field-11", {
                get: $$ => $$('.OrigCost'),
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }), __c_label("field-12", {
                get: $$ => $$('.vinnumber'),
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }) ]) ]) ]);
        }
    }();
});