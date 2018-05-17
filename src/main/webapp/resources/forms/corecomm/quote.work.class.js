define([ "require", "dfe-core", "dfe-common", "ui/utils", "dfe-field-helper", "components/label", "components/editbox", "components/dropdown", "components/button", "components/div", "components/editbox-money", "components/radiolist", "components/container", "components/table", "components/checkbox", "ui/jquery-ui" ], function(require, Core, cmn, uiUtils, fields, Label, Editbox, Dropdown, Button, Div, EditboxMoney, Radiolist, Container, Table, Checkbox, jQuery) {
    let Form = Core.Form;
    class QuoteWorkClassForm extends Form {
        constructor(node) {
            super(node);
            let $$ = node.unboundModel, ref = $$.first('insured.location');
            this.locationDefaults = ref && {
                address1: ref.get('.address'),
                city: ref.get('.city'),
                state: ref.get('.state'),
                zip: ref.get('.zip')
            };
            this.locationDefaults2 = $$.get('policy.bbop.location').map(ref => ({
                address1: ref.get('.address1'),
                city: ref.get('.city'),
                state: ref.get('.state'),
                zip: ref.get('.zip')
            }));
            $$.first('policy.work').defaultSubset('.location', this.locationDefaults).forEach(loc => loc.defaultSubset('.class'));
        }
        static fields() {   
            return Form.field(Div, "root", {
                get: $$ => $$.get('policy.work'),
                atr: () => ({
                    style: 'width: 550px'
                })
            }, [ Form.field(Table,"locs", {
                get: $$ => $$.get('.location'),
                val: $$ => $$.required('.location'),
                atr: $$ => ({
                    style: 'width: 100%',
                    skip: $$.get('.location').length > 1 ? [] : [ 'field-14' ]
                })
            }, [ Form.field(Label,"field-2", {
                class: "header",
                get: () => 'Location Informaton',
                layout: [ {
                    colSpan: "7",
                    style: "background-color: #7e8083; color: #fff; font-size: 12px; text-align: center; font-weight: bold; line-height: 2em;"
                } ]
            }), Form.field(Label,"field-3", {
                class: "header",
                get: () => '#',
                layout: [ {
                    newRow: true
                } ]
            }), Form.field(Label,"field-4", {
                class: "header",
                get: () => 'Street',
                layout: [ {
                   style: "width:45%"
                } ]
            }), Form.field(Label,"field-5", {
                class: "header",
                get: () => 'City',
                layout: [ {
                   style: "width:30%"
                } ]
            }), Form.field(Label,"field-6", {
                class: "header",
                get: () => 'State'
            }), Form.field(Label,"field-7", {
                class: "header",
                get: () => 'Zip Code',
                layout: [ {
                   style: "width:70px; min-width:70px"
                } ]
            }), Form.field(Label,"field-1", {
                class: "header",
                get: $$ => '',
                layout: [ {
                    colSpan: "2"
                } ]
            }), Form.field(Label,"field-9", {
                get: $$ => $$.index() + 1
            }), Form.field(Editbox, "field-10", {
                set: ($$, value) => ($$.set('.address1', value), $$.set('.addressLine', (value || '').toUpperCase())),
                atr: $$ => fields.simple('.address1', {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    maxlength: 50,
                    disabled: $$.get('.NoSpecificLocation') == 'Y'
                })
            }), Form.field(Editbox, "field-11", {
                atr: $$ => fields.simple('.city', {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    pattern: /[a-zA-Z ]{1,45}/,
                    disabled: $$.get('.NoSpecificLocation') == 'Y'
                })
            }), Form.field(Dropdown, "field-12", {
                set: function($$, value) {
                    this.processNoSpecificLocationChange($$, value, $$.get('.NoSpecificLocation'))
                },
                atr: () => fields.choice('.state', cmn.statesPattern.split('|'), {
                    style: 'width: 45px; border-radius: 1px; height: 20px'
                })
            }), Form.field(Editbox, "field-13", {
                atr: $$ => fields.simple('.zip', [ ($$, value) => value.match(/^\d{5}$/) || $$.error('Zip code is < 5 digits') ], {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    pattern: /\d{1,5}/,
                    disabled: $$.get('.NoSpecificLocation') == 'Y'
                })
            }), Form.field(Checkbox, "nospecific", {
                get: $$ => ({
                    checked: $$.get('.NoSpecificLocation'),
                    text: 'No Specific'
                }),
                set: function($$, value) {
                    this.processNoSpecificLocationChange($$, $$.get('.state'), value)
                },
                atr: $$ => ({
                    class: 'no-specific-field',
                    attributeMapper: pos => $$.get('.state').match(/MO|AZ|IN|IA|KY|MT|TX/) ? {...pos, style: 'visibility: hidden;'} : pos
                }),
                layout: [{ 
                    class: 'no-specific-field' 
                }]
            }), Form.field(Button, "field-14", {
                get: () => 'Delete',
                set: $$ => $$.detach()
            }), 
            Form.field(Container, { get: $$ => $$.get('.class').length ? [$$] : [], layout: [ { newRow: true } ] },
                Form.field(Table,"classes", {
                    get: $$ => $$.get('.class'),
                    val: $$ => $$.required('.class'),
                    atr: $$ => ({
                        style: 'width: 100%;',
                        skip: $$.get('.class').length > 1 ? [] : [ 'field-23', 'field-31' ]
                    }), layout: [ { colSpan: "7" } ]
                }, [ Form.field(Label,"field-39", {
                    class: "header",
                    get: () => 'Class Informaton',
                    layout: [ {
                        colSpan: "8",
                        style: 'background-color: #7e8083; color: #fff; font-size: 12px; text-align: center; font-weight: bold; line-height: 2em;'
                    } ]
                }), Form.field(Label,"field-17", {
                    class: "header",
                    get: () => '#',
                    layout: [ {
                        newRow: true
                    } ]
                }), Form.field(Label,"field-18", {
                    class: "header",
                    get: () => 'Class Code'
                }), Form.field(Label,"field-19", {
                    class: "header",
                    get: () => '# F.T. Employees'
                }), Form.field(Label,"field-20", {
                    class: "header",
                    get: () => '# P.T. Employees'
                }), Form.field(Label,"field-21", {
                    class: "header",
                    get: () => '# Seasonal Employees'
                }), Form.field(Label,"field-22", {
                    class: "header",
                    get: () => 'Est. Annual Remuneration'
                }), Form.field(Label,"field-16", {
                    class: "header",
                    get: $$ => 'If any',
                    atr: $$ => ({
                        style: 'white-space: nowrap'
                    })
                }), Form.field(Label,"field-23", {
                    class: "header",
                    get: () => ''
                }), Form.field(Label,"field-25", {
                    get: $$ => $$.index() + 1
                }), Form.field(Editbox, "field-26", {
                    atr: () => fields.simple('.code', [ ($$, value) => value ? value.match(/^\d{4}$/) || $$.error('Invalid format') : $$.error('Please enter class code') ], {
                        style: 'width: 50px; border-radius: 1px; height: 18px',
                        pattern: /\d{1,4}/
                    })
                }), Form.field(Editbox, "field-27", {
                    atr: $$ => fields.simple('.fulltimeemployeeamt', [ QuoteWorkClassForm.nbOnlyRequired ], {
                        style: 'width: 40px; border-radius: 1px; height: 18px',
                        pattern: /\d{1,3}/,
                        disabled: $$.get('.ifAny') == 'Y'
                    })
                }), Form.field(Editbox, "field-28", {
                    atr: $$ => fields.simple('.parttimeemployeeamt', [ QuoteWorkClassForm.nbOnlyRequired ], {
                        style: 'width: 40px; border-radius: 1px; height: 18px',
                        pattern: /\d{1,3}/,
                        disabled: $$.get('.ifAny') == 'Y'
                    })
                }), Form.field(Editbox, "field-29", {
                    atr: $$ => fields.simple('.seasonalemployeeamt', [], {
                        style: 'width: 40px; border-radius: 1px; height: 18px',
                        pattern: /\d{1,3}/,
                        disabled: $$.get('.ifAny') == 'Y'
                    })
                }), Form.field(EditboxMoney, "field-30", {
                    atr: $$ => fields.simple('.payroll', {
                        style: 'width: 80px; border-radius: 1px; height: 18px',
                        format: '99,999,999',
                        disabled: $$.get('.ifAny') == 'Y'
                    })
                }), Form.field(Checkbox, "field-8", {
                    set: ($$, value) => $$.set((value == 'Y' ? QuoteWorkClassForm.ifAnyEmptyFields() : []).reduce((clazz, field) => {
                        clazz[field] = '';
                        return clazz;
                    }, {
                        ifAny: value
                    })),
                    atr: $$ => fields.simple('.ifAny', {
                        disabled: $$.get('.ifAny') != 'Y' && $$.get('...location.class').filter(c => c.get('.ifAny') != 'Y').length < 2,
                        val: () => 0
                    }),
                    layout: [ {
                    style: "text-align: center"
                    } ]
                }), Form.field(Button, "field-31", {
                    get: () => 'Delete',
                    set: $$ => $$.detach(),
                    layout: [ {
                    style: "max-width: 50px"
                    } ]
                }), Form.field(Div, "field-37", {
                    get: $$ => $$.get('.code').length == 4 ? [ $$ ] : [],
                    layout: [ {
                        newRow: true,
                        colSpan: "8"
                    } ]
                }, [ Form.field(Radiolist, "field-32", {
                    get: $$ => cmn.ajaxFeed($$, {
                        query: {
                            action: 'getSubcodes',
                            classCode: $$.get('.code'),
                            effectiveDate: $$.get('...effective') == 0 ? '20180303' : $$.get('...effective'),
                            lob: 'WORK',
                            state: $$.get('..state'),
                            method: 'WORKClassCodeScriptHelper'
                        },
                        value: $$.get('.subcode'),
                        mapper: v => ({
                            value: v.combined,
                            description: `${v.classCode} - ${v.description}`
                        })
                    }),
                    set: ($$, value) => $$.set('.subcode', value),
                    atr: () => ({
                        style: 'padding: 2px 0px 0px 2px;',
                        orientation: 'vertical'
                    }),
                    layout: [ {
                        newRow: true,
                        colSpan: "7"
                    } ]
                }) ]), Form.field(Label,"field-33", {
                    get: () => '',
                    val: $$ => $$.get('.ifAny') == 'Y' && QuoteWorkClassForm.ifAnyEmptyFields().filter(field => $$.get('.' + field).toString() !== '').length && $$.error('If Any is selected, you may not enter Employees or Payroll'),
                    layout: [ {
                        newRow: true,
                        colSpan: "8"
                    } ]
                }) ]) ), 
            Form.field(Div, "field-35", {
                layout: [ {
                    newRow: true,
                    colSpan: "7",
                    class: 'inline-section-header'
                } ]
            }, [ Form.field(Button, "field-24", {
                get: () => 'Add additional class',
                set: $$ => $$.append('.class'),
                layout: [ {
                    style: "display: inline;"
                } ]
            }), Form.field(Button, "field-36", {
                get: () => 'Available class code list',
                set: $$ => QuoteWorkClassForm.showAvailable($$.get('..effective'), $$.get('.state')),
                layout: [ {
                    style: "display: none;"
                } ]
            }) ]) ]), Form.field(Button, "field-15", {
                get: () => 'Add additional location',
                set: function($$){
                    var index = $$.get('.location').length;
                    var defaults = this.locationDefaults2[index] || {state: this.locationDefaults.state};
                    $$.append('.location', defaults)[0].append('.class')
                }
            }), Form.field(Label,"field-34", {
                get: () => '',
                val: $$ => $$.get('.location.class').filter(c => c.get('.ifAny') != 'Y').length || $$.error('There must be payroll present on the submission')
            }) ]);
        }
        processNoSpecificLocationChange($$, newState, newNoSpecificLocation) {
            newState = newState.toString();
            newNoSpecificLocation = newNoSpecificLocation.toString()||'N'; 
            if (newState.match(/MO|AZ|IN|IA|KY|MT|TX/)) {
                newNoSpecificLocation = 'N';
            }
            if (newNoSpecificLocation == 'Y') {
                let thisLoc = $$, otherLocs = $$.get('..location').filter(loc => loc.get('.state') == newState && loc.get('.NoSpecificLocation') == 'Y');
                function update() {
                    otherLocs.forEach(otherLoc => (otherLoc.get('.class').forEach(clazz => (thisLoc.append('.class', clazz),
                    clazz.detach())), otherLoc.detach()));
                    $$.set({
                        NoSpecificLocation: newNoSpecificLocation,
                        address1: '',
                        city: '',
                        zip: '',
                        state: newState
                    });
                }
                if (otherLocs != 0) {
                    let ui = jQuery('<div>'), close = () => {
                        $$.$node.notify({action: 'notify'});
                        ui.dialog('destroy');
                    };
                    ui.text('Non-specific location for this state already exists. Would you like to merge?').dialog({
                        title: 'Question',
                        modal: true,
                        resizable: false,
                        close: close,
                        buttons: {
                            Yes: () => {
                                update();
                                close();
                            },
                            Cancel: () => close()
                        }
                    });
                } else {
                    update();
                }
            } else {
                $$.set(Object.assign({
                    state: newState,
                    NoSpecificLocation: newNoSpecificLocation
                }, newNoSpecificLocation == 'N' && $$.get('.NoSpecificLocation') == 'Y' && newState == this.locationDefaults.state ? this.locationDefaults : {}));
            }
        }
        static ifAnyEmptyFields() {
            return [ 'fulltimeemployeeamt', 'parttimeemployeeamt', 'seasonalemployeeamt', 'payroll' ];
        }
        static nbOnlyRequired($$, _, field) {
            $$.get('policy.common.quotetype') == 'NB' && $$.required(field);
        }
        static showAvailable(effDt, state) {
            ajaxCache.get({
                method: 'WORKClassCodeScriptHelper',
                action: 'getList',
                effectiveDate: effDt,
                list: 'classcode',
                lob: 'WORK',
                state: state
            }).then(data => {
                let ui = jQuery('<div>');
                ui.text(data.result.map(e => e.description).join('\n')).css('white-space', 'pre-wrap').dialog({
                    title: 'Available Class Code List',
                    width: 'auto',
                    height: 400,
                    close: function() {
                        ui.dialog('destroy');
                    }
                });
            });
        }
    }
    uiUtils.setDfeCustomStyle(`
        .no-specific-field {
            display: flex;
            white-space: nowrap;
        }
        .no-specific-field > input {
            margin: 3px;
        }
        .ui-widget-overlay {
            opacity: .3;
        }
    `, QuoteWorkClassForm.name);
    return QuoteWorkClassForm;
})