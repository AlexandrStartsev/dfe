defineForm([ "require", "dfe-common", "components/label", "components/radiolist", "components/editbox", "components/typeahead", "components/multioption", "components/div", "components/textarea" ], function(require, cmn, __c_label, __c_radiolist, __c_editbox, __c_typeahead, __c_multioption, __c_div, __c_textarea) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => $$('.policy'),
                atr: () => ({
                    class: 'div-alt-color2-3',
                    style: 'border: 1px solid darkgrey; border-radius: 5px; display: flex; flex-flow : row wrap; width: 700px; overflow: hidden'
                })
            }, [ __c_label("field-1", {
                get: () => 'Override Effective Date Limit',
                atr: () => ({
                    style: 'color: red'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_radiolist("field-2", {
                get: $$ => ({
                    value: $$('control.overrideeffectivelimit'),
                    items: [ {
                        value: 'Y',
                        description: 'Yes'
                    }, {
                        value: 'N',
                        description: 'No'
                    } ]
                }),
                set: ($$, value) => $$.set('control.overrideeffectivelimit', value),
                atr: () => ({
                    orientation: 'horizontal'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-3", {
                get: () => 'Coverage Effective Date',
                val: function($$) {
                    var eff;
                    $$.required('.effective', 'date') && (eff = cmn.ARFtoDate($$('.effective')), $$('control.overrideeffectivelimit') != 'Y' && (eff < cmn.today() && $$.error('Past date') || eff > cmn.today(+90) && $$.error('Over 90 days ahead')));
                },
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-4", {
                get: $$ => $$('.effective'),
                set: function($$, value) {
                    $$.set('.effective', value), $$.set('.common.effective', value);
                },
                atr: () => ({
                    formatting: 'MM/DD/YYYY',
                    transform: '67890134',
                    style: 'width: 100px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-5", {
                get: () => 'Coverage Expiration Date',
                val: function($$) {
                    var eff, exp;
                    $$.required('.expiration', 'date') && (exp = cmn.ARFtoDate($$('.expiration')), eff = cmn.ARFtoDate($$('.effective')), 
                    exp < eff && $$.error("Prior to effective date"), $$('control.overrideeffectivelimit') != 'Y' && exp > cmn.today(+365 + 90) && $$.error("Expiration date outside of limit"));
                },
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-6", {
                get: $$ => $$('.expiration'),
                set: function($$, value) {
                    $$.set('.expiration', value), $$.set('.common.expiration', value);
                },
                atr: () => ({
                    formatting: 'MM/DD/YYYY',
                    transform: '67890134',
                    style: 'width: 100px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-7", {
                get: () => 'Company name',
                val: $$ => $$.required('insured.compname'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-8", {
                get: $$ => $$('insured.compname'),
                set: ($$, value) => $$.set('insured.compname', value),
                atr: () => ({
                    style: 'width: 300px;'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-9", {
                get: $$ => 'DBA',
                val: $$ => $$.required('insured.dba'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-10", {
                get: $$ => $$('insured.dba'),
                set: ($$, value) => $$.set('insured.dba', value),
                atr: () => ({
                    style: 'width: 300px;'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_div("common", {
                get: $$ => $$('.common'),
                atr: () => ({
                    class: 'div-alt-color2-1',
                    style: 'overflow: visible;'
                }),
                pos: [ {
                    colstyle: "background: white; display: flex; width: 100%"
                } ]
            }, [ __c_label("field-11", {
                get: () => 'Year Business Started',
                val: $$ => $$.required('.YearBizStarted', '(18|19|20)\\d{2}'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-12", {
                get: $$ => $$('.YearBizStarted'),
                set: ($$, value) => $$.set('.YearBizStarted', value),
                atr: () => ({
                    style: 'width: 50px',
                    formatting: 'XXXX'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-13", {
                get: () => 'Industry Segment',
                val: $$ => $$.required('.SICCd'),
                pos: [ {
                    colclass: "dfe-field-std-p0",
                    colstyle: "padding: 3px 0px 0px 4px; z-index: 1"
                } ]
            }), __c_typeahead("field-14", {
                get: $$ => cmn.ajaxFeed($$, {
                    query: {
                        action: 'getSicNaics',
                        state: $$('.StateofDomicile'),
                        effdate: $$('.effective'),
                        method: 'BBOPClassCodeScriptHelper'
                    },
                    value: {
                        sicCode: $$('.SICCd'),
                        naicsCode: $$('.NAICSCd')
                    }
                }),
                set: function($$, value) {
                    $$.set('.SICCd', value.sicCode);
                    $$.set('.NAICSCd', value.naicsCode);
                },
                atr: () => ({
                    options: {
                        searchOnFocus: 'true',
                        template: 'SIC: {{sicCode}} / NAICS: {{naicsCode}} ({{naicsDescription}})',
                        display: [ 'naicsCode', 'sicCode', 'naicsDescription' ]
                    },
                    display: 'naicsDescription',
                    filter: function(items) {
                        var o = {};
                        return items.filter(function(v) {
                            var key = v.sicCode + v.naicsCode + v.naicsDescription, p = o[key];
                            o[key] = 1;
                            return !p;
                        });
                    }
                }),
                pos: [ {
                    colclass: "dfe-field-std-p0"
                } ]
            }), __c_label("field-15", {
                get: () => 'SIC',
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-16", {
                get: $$ => $$('.SICCd'),
                atr: () => ({
                    disabled: 'y',
                    style: 'width: 50px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-17", {
                get: () => 'NAICS',
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-18", {
                get: $$ => $$('.NAICSCd'),
                atr: () => ({
                    disabled: 'y',
                    style: 'width: 70px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-19", {
                get: () => 'State of Domicile',
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-20", {
                get: $$ => $$('.StateofDomicile'),
                set: ($$, value) => $$.set('.StateofDomicile', value),
                atr: () => ({
                    disabled: 'y',
                    style: 'width: 30px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-21", {
                get: () => 'Mark any location states:',
                val: $$ => $$.required('.ApplicableStates'),
                pos: [ {
                    colclass: "dfe-field-std-p0",
                    colstyle: "padding: 3px 0px 0px 4px; z-index: 1"
                } ]
            }), __c_multioption("field-22", {
                get: $$ => ({
                    value: $$('.ApplicableStates'),
                    options: cmn.statesPattern.split('|')
                }),
                set: ($$, value) => $$.set('.ApplicableStates', value),
                atr: () => ({
                    style: 'display: table;',
                    rowstyle: 'min-width: 65px;padding: 0px;display: inline-block;align-content: center'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p0"
                } ]
            }) ]), __c_div("producer", {
                get: $$ => $$('.producer'),
                atr: () => ({
                    class: 'div-alt-color2-4',
                    style: 'max-width: 100%'
                }),
                pos: [ {
                    colstyle: "display: flex; width: 100%; background: white;"
                } ]
            }, [ __c_label("field-24", {
                get: () => 'Producer Contact Information',
                atr: () => ({
                    style: 'color: white;'
                }),
                pos: [ {
                    colclass: "div-section-header",
                    colstyle: "background: slategrey;"
                } ]
            }), __c_label("field-26", {
                get: () => 'Producer Contact Name',
                val: $$ => $$.required('.name'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-27", {
                get: $$ => $$('.name'),
                set: ($$, value) => $$.set('.name', value),
                atr: () => ({
                    style: 'width: 300px;'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-28", {
                get: () => 'Producer Contact Email',
                val: $$ => $$.required('.email', '[^@ ]+@[^@ ]+\\.[^@ ]{1,4}'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-29", {
                get: $$ => $$('.email'),
                set: ($$, value) => $$.set('.email', value),
                atr: () => ({
                    style: 'width: 300px;',
                    pattern: '[^@ ]+(@([^@ ]+(\\.[^@ ]{0,4})?)?)?'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-30", {
                get: () => 'Confirm Producer Contact Email',
                val: $$ => $$.required('.emailconfirm', '[^@ ]+@[^@ ]+\\.[^@ ]{1,4}') && $$('.emailconfirm') != $$('.email') && $$.error("Email doesn't match"),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-31", {
                get: $$ => $$('.emailconfirm'),
                set: ($$, value) => $$.set('.emailconfirm', value),
                atr: () => ({
                    style: 'width: 300px;',
                    pattern: '[^@ ]+(@([^@ ]+(\\.[^@ ]{0,4})?)?)?'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-32", {
                get: () => 'Producer Additional CC Email',
                val: $$ => $$('.emailcc') != 0 && $$.required('.emailcc', '[^@ ]+@[^@ ]+\\.[^@ ]{1,4}'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-33", {
                get: $$ => $$('.emailcc'),
                set: ($$, value) => $$.set('.emailcc', value),
                atr: () => ({
                    style: 'width: 300px;',
                    pattern: '[^@ ]+(@([^@ ]+(\\.[^@ ]{0,4})?)?)?'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_label("field-34", {
                get: () => 'Phone Number',
                val: $$ => $$.required('.phone', '^\\d{3}-\\d{3}-\\d{4}$'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_editbox("field-35", {
                get: $$ => $$('.phone'),
                set: ($$, value) => $$.set('.phone', value),
                atr: () => ({
                    formatting: 'XXX-XXX-XXXX',
                    style: 'width: 120px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }), __c_div("notes", {
                get: $$ => [ $$ ],
                atr: () => ({
                    class: 'div-alt-color3-4'
                }),
                pos: [ {
                    colstyle: "padding: 4px; background: white; display: flex; width: 100%; box-sizing: border-box;"
                } ]
            }, [ __c_label("field-36", {
                get: () => '<b>Note:</b> this contact information will be used to communicate with your agency regarding questions about this submission, for delivery of quotes and binders, and any other contact necessay related to this submission.'
            }), __c_label("field-37", {
                get: () => 'Comments to the Underwriter:',
                pos: [ {
                    colclass: "dfe-field-std-p0"
                } ]
            }), __c_textarea("field-38", {
                get: $$ => $$('.comments'),
                set: ($$, value) => $$.set('.comments', value),
                atr: () => ({
                    style: 'height: 70px; width: 100%; box-sizing: border-box; border-radius: 3px; resize: none'
                }),
                pos: [ {
                    colstyle: "width: 100%;"
                } ]
            }) ]) ]) ]);
        }
        onstart($$) {
            $$.defaultSubset('policy.producer');
            $$.defaultValue('policy.effective', cmn.yyyymmdd(cmn.today()));
            $$.defaultValue('policy.common.StateofDomicile', 'KS');
            $$.defaultValue('control.overrideeffectivelimit', 'N');
        }
        setup() {}
    }();
});