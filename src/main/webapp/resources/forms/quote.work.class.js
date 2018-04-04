defineForm("quote.work.class", [ "require", "dfe-common", "dfe-field-helper", "components/label", "components/editbox", "components/dropdown", "components/button", "components/div", "components/editbox-$", "components/radiolist", "components/container" ], function(require, cmn, fields, __c_label, __c_editbox, __c_dropdown, __c_button, __c_div, __c_editbox_$, __c_radiolist, __c_container) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => $$('policy.work'),
                atr: () => ({
                    vstrategy: 'always',
                    style: 'width: 550px'
                })
            }, [ __c_container("locs", {
                get: $$ => $$('.location'),
                val: $$ => $$.required('.location'),
                atr: $$ => ({
                    style: 'width: 100%',
                    skip: $$('.location').length > 1 ? [] : [ 'field-8', 'field-14' ]
                })
            }, [ __c_label("field-2", {
                class: "header",
                get: () => 'Location Informaton',
                atr: () => ({
                    style: 'background-color: #7e8083; color: #fff; font-size: 12px; text-align: center; font-weight: bold; line-height: 2em; display: block; '
                }),
                pos: [ {
                    w: "6"
                } ]
            }), __c_label("field-3", {
                class: "header",
                get: () => '#',
                pos: [ {
                    n: "Y"
                } ]
            }), __c_label("field-4", {
                class: "header",
                get: () => 'Street',
                pos: [ {
                    s: "width:45%"
                } ]
            }), __c_label("field-5", {
                class: "header",
                get: () => 'City',
                pos: [ {
                    s: "width:30%"
                } ]
            }), __c_label("field-6", {
                class: "header",
                get: () => 'State'
            }), __c_label("field-7", {
                class: "header",
                get: () => 'Zip Code',
                pos: [ {
                    s: "width:70px; min-width:70px"
                } ]
            }), __c_label("field-8", {
                class: "header",
                get: () => ''
            }), __c_label("field-9", {
                get: $$ => $$.index() + 1
            }), __c_editbox("field-10", {
                set: ($$, value) => ($$.set('.address1', value), $$.set('.addressLine', (value || '').toUpperCase())),
                atr: () => fields.simple('.address1', {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    maxlength: 50
                })
            }), __c_editbox("field-11", {
                atr: () => fields.simple('.city', {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    pattern: '[a-zA-Z ]{1,45}'
                })
            }), __c_dropdown("field-12", {
                atr: () => fields.choice('.state', cmn.statesPattern.split('|'), {
                    style: 'width: 45px; border-radius: 1px; height: 20px'
                })
            }), __c_editbox("field-13", {
                atr: () => fields.simple('.zip', [ ($$, fld) => $$.required(fld, '\\d{5}', 'Zip code is < 5 digits') ], {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    pattern: '\\d{1,5}'
                })
            }), __c_button("field-14", {
                get: () => 'Delete',
                set: $$ => $$.detach()
            }), __c_container("classes", {
                get: $$ => $$('.class'),
                val: $$ => $$.required('.class'),
                atr: $$ => ({
                    style: 'width: 100%;',
                    skip: $$('.class').length > 1 ? [] : [ 'field-23', 'field-31' ]
                }),
                pos: [ {
                    n: "Y",
                    w: "7"
                } ]
            }, [ __c_div("field-38", {
                class: "header",
                get: $$ => [ $$ ],
                pos: [ {
                    w: "7"
                } ]
            }, [ __c_label("field-39", {
                get: () => 'Class Informaton',
                atr: () => ({
                    style: 'background-color: #7e8083; color: #fff; font-size: 12px; text-align: center; font-weight: bold; display: block; line-height: 2em;'
                })
            }) ]), __c_label("field-17", {
                class: "header",
                get: () => '#',
                pos: [ {
                    n: "Y"
                } ]
            }), __c_label("field-18", {
                class: "header",
                get: () => 'Class Code'
            }), __c_label("field-19", {
                class: "header",
                get: () => '# F.T. Employees'
            }), __c_label("field-20", {
                class: "header",
                get: () => '# P.T. Employees'
            }), __c_label("field-21", {
                class: "header",
                get: () => '# Seasonal Employees'
            }), __c_label("field-22", {
                class: "header",
                get: () => 'Est. Annual Remuneration'
            }), __c_label("field-23", {
                class: "header",
                get: () => ''
            }), __c_label("field-25", {
                get: $$ => $$.index() + 1
            }), __c_editbox("field-26", {
                atr: () => fields.simple('.code', [ ($$, f) => $$.required(f, 0, 'Please enter class code') && $$.required(f, '\\d{4}') ], {
                    style: 'width: 50px; border-radius: 1px; height: 18px',
                    pattern: '\\d{1,4}'
                })
            }), __c_editbox("field-27", {
                atr: () => fields.simple('.fulltimeemployeeamt', [ this.nbOnlyRequired ], {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: '\\d{1,3}'
                })
            }), __c_editbox("field-28", {
                atr: () => fields.simple('.parttimeemployeeamt', [ this.nbOnlyRequired ], {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: '\\d{1,3}'
                })
            }), __c_editbox("field-29", {
                atr: () => fields.simple('.seasonalemployeeamt', [], {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: '\\d{1,3}'
                })
            }), __c_editbox_$("field-30", {
                atr: () => fields.simple('.payroll', {
                    style: 'width: 80px; border-radius: 1px; height: 18px',
                    formatting: '99,999,999'
                })
            }), __c_button("field-31", {
                get: () => 'Delete',
                set: $$ => $$.detach(),
                pos: [ {
                    s: "max-width: 40px"
                } ]
            }), __c_div("field-37", {
                get: $$ => $$('.code').length == 4 ? [ $$ ] : [],
                pos: [ {
                    n: "Y",
                    w: "7"
                } ]
            }, [ __c_radiolist("field-32", {
                get: $$ => cmn.ajaxFeed($$, {
                    query: {
                        action: 'getSubcodes',
                        classCode: $$('.code'),
                        effectiveDate: $$('...effective') == 0 ? '20180303' : $$('...effective'),
                        lob: 'WORK',
                        state: $$('..state'),
                        method: 'WORKClassCodeScriptHelper'
                    },
                    value: $$('.subcode'),
                    mapper: v => ({
                        value: v.combined,
                        description: `${v.classCode} - ${v.description}`
                    })
                }),
                set: ($$, value) => $$.set('.subcode', value),
                atr: () => ({
                    style: 'padding: 2px 0px 0px 2px;'
                }),
                pos: [ {
                    n: "Y",
                    w: "7"
                } ]
            }) ]) ]), __c_div("field-35", {
                get: $$ => [ $$ ],
                atr: () => ({
                    style: 'background: #dcdcdc; padding: 2px'
                }),
                pos: [ {
                    n: "Y",
                    w: "6"
                } ]
            }, [ __c_button("field-24", {
                get: () => 'Add additional class',
                set: $$ => $$.append('.class'),
                pos: [ {
                    colstyle: "display: inline;"
                } ]
            }), __c_button("field-36", {
                get: () => 'Available class code list',
                set: $$ => this.showAvailable($$('..effective'), $$('.state')),
                pos: [ {
                    colstyle: "display: none;"
                } ]
            }) ]) ]), __c_button("field-15", {
                get: () => 'Add additional location',
                set: $$ => $$.append('.location', this.locationDefaults)[0].append('.class')
            }) ]);
        }
        nbOnlyRequired($$, field) {
            $$('policy.common.quotetype')=='NB' && $$.required(field)
        }
        onstart($$) {
            var ref = $$.first('insured.location');
            this.locationDefaults = ref && {
                address1: ref.get('.address'),
                city: ref.get('.city'),
                state: ref.get('.state'),
                zip: ref.get('.zip')
            };
            $$.first('policy.work').defaultSubset('.location', this.locationDefaults).forEach(loc => loc.defaultSubset('.class'));
        }
        onpost($$) {}
        showAvailable(effDt, state) {
            Promise.all(require([ 'ui/jquery-ui' ]), ajaxCache.get({
                method: 'WORKClassCodeScriptHelper',
                action: 'getList',
                effectiveDate: effDt,
                list: 'classcode',
                lob: 'WORK',
                state: state
            })).then(dep => {
                dep[0]('<div>').text(dep[1].result.map(e => e.description).join('\n')).css('white-space', 'pre-wrap').dialog({
                    title: 'Available Class Code List',
                    width: 'auto',
                    height: 400,
                    close: function() {
                        dep[0](this).dialog('destroy');
                    }
                });
            });
        }
        setup() {}
    }();
});