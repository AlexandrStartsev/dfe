defineForm("quote.industry", [ "require", "dfe-common", "components/div", "components/label", "components/radiolist", "components/editbox", "components/typeahead", "components/multioption", "components/textarea" ], function(require, cmn, __c_div, __c_label, __c_radiolist, __c_editbox, __c_typeahead, __c_multioption, __c_textarea) {
    return new class {
        constructor() {
            this.dfe = [ {
                name: "root",
                component: __c_div,
                get: $$ => $$('.policy'),
                atr: () => ({
                    class: 'div-alt-color2-3',
                    style: 'border: 1px solid darkgrey; border-radius: 5px; display: flex; flex-flow : row wrap; width: 700px; overflow: hidden'
                })
            }, {
                name: "field-1",
                component: __c_label,
                parent: "root",
                get: () => 'Override Effective Date Limit',
                atr: () => ({
                    style: 'color: red'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-2",
                component: __c_radiolist,
                parent: "root",
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
            }, {
                name: "field-3",
                component: __c_label,
                parent: "root",
                get: () => 'Coverage Effective Date',
                val: function($$) {
                    var eff;
                    $$.required('.effective', 'date') && (eff = cmn.ARFtoDate($$('.effective')), $$('control.overrideeffectivelimit') != 'Y' && (eff < cmn.today() && $$.error('Past date') || eff > cmn.today(+90) && $$.error('Over 90 days ahead')));
                },
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-4",
                component: __c_editbox,
                parent: "root",
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
            }, {
                name: "field-5",
                component: __c_label,
                parent: "root",
                get: () => 'Coverage Expiration Date',
                val: function($$) {
                    var eff, exp;
                    $$.required('.expiration', 'date') && (exp = cmn.ARFtoDate($$('.expiration')), eff = cmn.ARFtoDate($$('.effective')), 
                    exp < eff && $$.error("Prior to effective date"), $$('control.overrideeffectivelimit') != 'Y' && exp > cmn.today(+365 + 90) && $$.error("Expiration date outside of limit"));
                },
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-6",
                component: __c_editbox,
                parent: "root",
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
            }, {
                name: "field-7",
                component: __c_label,
                parent: "root",
                get: () => 'Company name',
                val: $$ => $$.required('insured.compname'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-8",
                component: __c_editbox,
                parent: "root",
                get: $$ => $$('insured.compname'),
                set: ($$, value) => $$.set('insured.compname', value),
                atr: () => ({
                    style: 'width: 300px;'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-9",
                component: __c_label,
                parent: "root",
                get: $$ => 'DBA',
                val: $$ => $$.required('insured.dba'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-11",
                component: __c_label,
                parent: "common",
                get: () => 'Year Business Started',
                val: $$ => $$.required('.YearBizStarted', '(18|19|20)\\d{2}'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-10",
                component: __c_editbox,
                parent: "root",
                get: $$ => $$('insured.dba'),
                set: ($$, value) => $$.set('insured.dba', value),
                atr: () => ({
                    style: 'width: 300px;'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-12",
                component: __c_editbox,
                parent: "common",
                get: $$ => $$('.YearBizStarted'),
                set: ($$, value) => $$.set('.YearBizStarted', value),
                atr: () => ({
                    style: 'width: 50px',
                    formatting: 'XXXX'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-13",
                component: __c_label,
                parent: "common",
                get: () => 'Industry Segment',
                val: $$ => $$.required('.SICCd'),
                pos: [ {
                    colclass: "dfe-field-std-p0",
                    colstyle: "padding: 3px 0px 0px 4px; z-index: 1"
                } ]
            }, {
                name: "field-14",
                component: __c_typeahead,
                parent: "common",
                get: $$ => cmn.ajaxFeed($$, {
                    query: { action: 'getSicNaics', state: $$('.StateofDomicile'), effdate: $$('.effective'), method: 'BBOPClassCodeScriptHelper' },
                    param: {
                        sic: $$('.SICCd'),
                        naics: $$('.NAICSCd')
                    }
                }),
                set: function($$, value) {
                    $$.set('.SICCd', value.sic);
                    $$.set('.NAICSCd', value.naics);
                },
                atr: () => ({
                    options: {
                        searchOnFocus: 'true',
                        template: 'SIC: {{sic}} / NAICS: {{naics}} - {{description}}',
                        display: [ 'naics', 'sic', 'description' ]
                    },
                    display: 'description'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p0"
                } ]
            }, {
                name: "field-15",
                component: __c_label,
                parent: "common",
                get: () => 'SIC',
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-16",
                component: __c_editbox,
                parent: "common",
                get: $$ => $$('.SICCd'),
                atr: () => ({
                    disabled: 'y',
                    style: 'width: 50px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-17",
                component: __c_label,
                parent: "common",
                get: () => 'NAICS',
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-18",
                component: __c_editbox,
                parent: "common",
                get: $$ => $$('.NAICSCd'),
                atr: () => ({
                    disabled: 'y',
                    style: 'width: 70px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-19",
                component: __c_label,
                parent: "common",
                get: () => 'State of Domicile',
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-20",
                component: __c_editbox,
                parent: "common",
                get: $$ => $$('.StateofDomicile'),
                set: ($$, value) => $$.set('.StateofDomicile', value),
                atr: () => ({
                    disabled: 'y',
                    style: 'width: 30px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "common",
                component: __c_div,
                parent: "root",
                get: $$ => $$('.common'),
                atr: () => ({
                    class: 'div-alt-color2-1',
                    style: 'overflow: visible;'
                }),
                pos: [ {
                    colstyle: "background: white; display: flex; width: 100%"
                } ]
            }, {
                name: "field-21",
                component: __c_label,
                parent: "common",
                get: () => 'Mark any location states:',
                val: $$ => $$.required('.ApplicableStates'),
                pos: [ {
                    colclass: "dfe-field-std-p0",
                    colstyle: "padding: 3px 0px 0px 4px; z-index: 1"
                } ]
            }, {
                name: "field-22",
                component: __c_multioption,
                parent: "common",
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
            }, {
                name: "producer",
                component: __c_div,
                parent: "root",
                get: $$ => $$('.producer'),
                atr: () => ({
                    class: 'div-alt-color2-4',
                    style: 'max-width: 100%'
                }),
                pos: [ {
                    colstyle: "display: flex; width: 100%; background: white;"
                } ]
            }, {
                name: "field-24",
                component: __c_label,
                parent: "producer",
                get: () => 'Producer Contact Information',
                atr: () => ({
                    style: 'color: white;'
                }),
                pos: [ {
                    colclass: "div-section-header",
                    colstyle: "background: slategrey;"
                } ]
            }, {
                name: "field-26",
                component: __c_label,
                parent: "producer",
                get: () => 'Producer Contact Name',
                val: $$ => $$.required('.name'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-27",
                component: __c_editbox,
                parent: "producer",
                get: $$ => $$('.name'),
                set: ($$, value) => $$.set('.name', value),
                atr: () => ({
                    style: 'width: 300px;'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-28",
                component: __c_label,
                parent: "producer",
                get: () => 'Producer Contact Email',
                val: $$ => $$.required('.email', '[^@ ]+@[^@ ]+\\.[^@ ]{1,4}'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-29",
                component: __c_editbox,
                parent: "producer",
                get: $$ => $$('.email'),
                set: ($$, value) => $$.set('.email', value),
                atr: () => ({
                    style: 'width: 300px;',
                    pattern: '[^@ ]+(@([^@ ]+(\\.[^@ ]{0,4})?)?)?'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-30",
                component: __c_label,
                parent: "producer",
                get: () => 'Confirm Producer Contact Email',
                val: $$ => $$.required('.emailconfirm', '[^@ ]+@[^@ ]+\\.[^@ ]{1,4}') && $$('.emailconfirm') != $$('.email') && $$.error("Email doesn't match"),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-31",
                component: __c_editbox,
                parent: "producer",
                get: $$ => $$('.emailconfirm'),
                set: ($$, value) => $$.set('.emailconfirm', value),
                atr: () => ({
                    style: 'width: 300px;',
                    pattern: '[^@ ]+(@([^@ ]+(\\.[^@ ]{0,4})?)?)?'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-32",
                component: __c_label,
                parent: "producer",
                get: () => 'Producer Additional CC Email',
                val: $$ => $$('.emailcc') != 0 && $$.required('.emailcc', '[^@ ]+@[^@ ]+\\.[^@ ]{1,4}'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-33",
                component: __c_editbox,
                parent: "producer",
                get: $$ => $$('.emailcc'),
                set: ($$, value) => $$.set('.emailcc', value),
                atr: () => ({
                    style: 'width: 300px;',
                    pattern: '[^@ ]+(@([^@ ]+(\\.[^@ ]{0,4})?)?)?'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-34",
                component: __c_label,
                parent: "producer",
                get: () => 'Phone Number',
                val: $$ => $$.required('.phone', '^\\d{3}-\\d{3}-\\d{4}$'),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "field-35",
                component: __c_editbox,
                parent: "producer",
                get: $$ => $$('.phone'),
                set: ($$, value) => $$.set('.phone', value),
                atr: () => ({
                    formatting: 'XXX-XXX-XXXX',
                    style: 'width: 120px'
                }),
                pos: [ {
                    colclass: "dfe-field-std-p5"
                } ]
            }, {
                name: "notes",
                component: __c_div,
                parent: "producer",
                get: $$ => [ $$ ],
                atr: () => ({
                    class: 'div-alt-color3-4'
                }),
                pos: [ {
                    colstyle: "padding: 4px; background: white; display: flex; width: 100%; box-sizing: border-box;"
                } ]
            }, {
                name: "field-36",
                component: __c_label,
                parent: "notes",
                get: () => '<b>Note:</b> this contact information will be used to communicate with your agency regarding questions about this submission, for delivery of quotes and binders, and any other contact necessay related to this submission.'
            }, {
                name: "field-37",
                component: __c_label,
                parent: "notes",
                get: () => 'Comments to the Underwriter:',
                pos: [ {
                    colclass: "dfe-field-std-p0"
                } ]
            }, {
                name: "field-38",
                component: __c_textarea,
                parent: "notes",
                get: $$ => $$('.comments'),
                set: ($$, value) => $$.set('.comments', value),
                atr: () => ({
                    style: 'height: 70px; width: 100%; box-sizing: border-box; border-radius: 3px; resize: none'
                }),
                pos: [ {
                    colstyle: "width: 100%;"
                } ]
            } ];
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