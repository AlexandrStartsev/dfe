defineForm([ "require", "dfe-common", "ui/utils", "dfe-field-helper", "components/label", "components/editbox", "components/dropdown", "components/button", "components/div", "components/editbox-$", "components/radiolist", "components/container", "components/checkbox", "ui/jquery-ui" ], function(require, cmn, uiUtils, fields, __c_label, __c_editbox, __c_dropdown, __c_button, __c_div, __c_editbox_$, __c_radiolist, __c_container, __c_checkbox, jQuery) {
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
                    skip: $$('.location').length > 1 ? [] : [ 'field-14' ]
                })
            }, [ __c_label("field-2", {
                class: "header",
                get: () => 'Location Informaton',
                atr: () => ({
                    style: 'background-color: #7e8083; color: #fff; font-size: 12px; text-align: center; font-weight: bold; line-height: 2em; display: block; '
                }),
                pos: [ {
                    w: "7"
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
            }), __c_label("field-1", {
                class: "header",
                get: $$ => '',
                pos: [ {
                    w: "2"
                } ]
            }), __c_label("field-9", {
                get: $$ => $$.index() + 1
            }), __c_editbox("field-10", {
                set: ($$, value) => ($$.set('.address1', value), $$.set('.addressLine', (value || '').toUpperCase())),
                atr: $$ => fields.simple('.address1', {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    maxlength: 50,
                    disabled: $$('.NoSpecificLocation') == 'Y'
                })
            }), __c_editbox("field-11", {
                atr: $$ => fields.simple('.city', {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    pattern: /[a-zA-Z ]{1,45}/,
                    disabled: $$('.NoSpecificLocation') == 'Y'
                })
            }), __c_dropdown("field-12", {
                set: ($$, value) => this.processNoSpecificLocationChange($$, value, $$('.NoSpecificLocation')),
                atr: () => fields.choice('.state', cmn.statesPattern.split('|'), {
                    style: 'width: 45px; border-radius: 1px; height: 20px'
                })
            }), __c_editbox("field-13", {
                atr: $$ => fields.simple('.zip', [ ($$, value) => value.match(/^\d{5}$/) || $$.error('Zip code is < 5 digits') ], {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    pattern: /\d{1,5}/,
                    disabled: $$('.NoSpecificLocation') == 'Y'
                })
            }), __c_checkbox("nospecific", {
                get: $$ => ({
                    checked: $$('.NoSpecificLocation'),
                    text: 'No Specific'
                }),
                set: ($$, value) => this.processNoSpecificLocationChange($$, $$('.state'), value),
                atr: $$ => ({
                    class: 'no-specific-field',
                    style: $$('.state').match(/MO|AZ|IN|IA|KY|MT|TX/) && 'display: none'
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
                    w: "8"
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
            }), __c_label("field-16", {
                class: "header",
                get: $$ => 'If any',
                atr: $$ => ({
                    style: 'white-space: nowrap'
                })
            }), __c_label("field-23", {
                class: "header",
                get: () => ''
            }), __c_label("field-25", {
                get: $$ => $$.index() + 1
            }), __c_editbox("field-26", {
                atr: () => fields.simple('.code', [ ($$, value) => value ? value.match(/^\d{4}$/) || $$.error('Invalid format') : $$.error('Please enter class code') ], {
                    style: 'width: 50px; border-radius: 1px; height: 18px',
                    pattern: /\d{1,4}/
                })
            }), __c_editbox("field-27", {
                atr: $$ => fields.simple('.fulltimeemployeeamt', [ this.nbOnlyRequired ], {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: /\d{1,3}/,
                    disabled: $$('.ifAny') == 'Y'
                })
            }), __c_editbox("field-28", {
                atr: $$ => fields.simple('.parttimeemployeeamt', [ this.nbOnlyRequired ], {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: /\d{1,3}/,
                    disabled: $$('.ifAny') == 'Y'
                })
            }), __c_editbox("field-29", {
                atr: $$ => fields.simple('.seasonalemployeeamt', [], {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: /\d{1,3}/,
                    disabled: $$('.ifAny') == 'Y'
                })
            }), __c_editbox_$("field-30", {
                atr: $$ => fields.simple('.payroll', {
                    style: 'width: 80px; border-radius: 1px; height: 18px',
                    formatting: '99,999,999',
                    disabled: $$('.ifAny') == 'Y'
                })
            }), __c_checkbox("field-8", {
                set: ($$, value) => $$.set((value == 'Y' ? this.ifAnyEmptyFields() : []).reduce((clazz, field) => {
                    clazz[field] = '';
                    return clazz;
                }, {
                    ifAny: value
                })),
                atr: $$ => fields.simple('.ifAny', {
                    disabled: $$('.ifAny') != 'Y' && $$('...location.class').filter(c => c.get('.ifAny') != 'Y').length < 2,
                    val: () => 0
                }),
                pos: [ {
                    s: "text-align: center"
                } ]
            }), __c_button("field-31", {
                get: () => 'Delete',
                set: $$ => $$.detach(),
                pos: [ {
                    s: "max-width: 50px"
                } ]
            }), __c_div("field-37", {
                get: $$ => $$('.code').length == 4 ? [ $$ ] : [],
                pos: [ {
                    n: "Y",
                    w: "8"
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
            }) ]), __c_label("field-33", {
                get: () => '',
                val: $$ => $$('.ifAny') == 'Y' && this.ifAnyEmptyFields().filter(field => $$('.' + field).toString() !== '').length && $$.error('If Any is selected, you may not enter Employees or Payroll'),
                pos: [ {
                    n: "Y",
                    w: "8"
                } ]
            }) ]), __c_div("field-35", {
                get: $$ => [ $$ ],
                atr: () => ({
                    style: 'background: #dcdcdc; padding: 2px'
                }),
                pos: [ {
                    n: "Y",
                    w: "7"
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
                set: $$ => {
                    var index = $$.get('.location').length;
                    var defaults = this.locationDefaults2[index] || {state:this.locationDefaults.state};
                    $$.append('.location', defaults)[0].append('.class')
                }
            }), __c_label("field-34", {
                get: () => '',
                val: $$ => $$('.location.class').filter(c => c.get('.ifAny') != 'Y').length || $$.error('There must be payroll present on the submission')
            }) ]);
        }
        processNoSpecificLocationChange($$, newState, newNoSpecificLocation) {
            if (newState.match(/MO|AZ|IN|IA|KY|MT|TX/)) {
                newNoSpecificLocation = 'N';
            }
            if (newNoSpecificLocation == 'Y') {
                let thisLoc = $$, otherLocs = $$('..location').filter(loc => loc.get('.state') == newState && loc.get('.NoSpecificLocation') == 'Y');
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
                        $$.control.notifications.push({
                            action: 'notify'
                        });
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
                }, newNoSpecificLocation == 'N' && $$('.NoSpecificLocation') == 'Y' && newState == this.locationDefaults.state ? this.locationDefaults : {}));
            }
        }
        ifAnyEmptyFields() {
            return [ 'fulltimeemployeeamt', 'parttimeemployeeamt', 'seasonalemployeeamt', 'payroll' ];
        }
        nbOnlyRequired($$, _, field) {
            $$('policy.common.quotetype') == 'NB' && $$.required(field);
        }
        onstart($$) {
            var ref = $$.first('insured.location');
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
        onpost($$) {}
        showAvailable(effDt, state) {
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
        setup() {
            uiUtils.setDfeCustomStyle(`
                .no-specific-field {
                    display: flex;
                }
                .no-specific-field > input {
                    margin: 3px;
                }
                .no-specific-field > label {
                    white-space: nowrap;
                }
                .ui-widget-overlay {
            		opacity: .3;
                }
            `, this.name);
        }
    }();
});