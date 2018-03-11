defineForm("quote.work.class", [ "require", "jquery-ui", "dfe-common", "dfe-field-helper", "components/div", "components/container", "components/label", "components/editbox", "components/dropdown", "components/button", "components/editbox-$", "components/radiolist" ], function(require, $, cmn, fields, __c_div, __c_container, __c_label, __c_editbox, __c_dropdown, __c_button, __c_editbox_$, __c_radiolist) {
    return new class {
        constructor() {
            this.dfe = [ {
                name: "root",
                component: __c_div,
                get: $$ => $$('policy.work'),
                atr: () => ({
                    vstrategy: 'always',
                    style: 'width: 550px'
                })
            }, {
                name: "locs",
                component: __c_container,
                parent: "root",
                get: $$ => $$('.location'),
                atr: $$ => ({
                    style: 'width: 100%',
                    skip: $$('.location').length > 1 ? [] : [ 'field-8', 'field-14' ]
                })
            }, {
                name: "field-2",
                component: __c_label,
                parent: "locs",
                class: "header",
                get: () => 'Location Informaton',
                atr: () => ({
                    style: 'background-color: #7e8083; color: #fff; font-size: 12px; text-align: center; font-weight: bold; line-height: 2em; display: block; '
                }),
                pos: [ {
                    w: "6"
                } ]
            }, {
                name: "field-3",
                component: __c_label,
                parent: "locs",
                class: "header",
                get: () => '#',
                pos: [ {
                    n: "Y"
                } ]
            }, {
                name: "field-4",
                component: __c_label,
                parent: "locs",
                class: "header",
                get: () => 'Street',
                pos: [ {
                    s: "width:45%"
                } ]
            }, {
                name: "field-5",
                component: __c_label,
                parent: "locs",
                class: "header",
                get: () => 'City',
                pos: [ {
                    s: "width:30%"
                } ]
            }, {
                name: "field-6",
                component: __c_label,
                parent: "locs",
                class: "header",
                get: () => 'State'
            }, {
                name: "field-7",
                component: __c_label,
                parent: "locs",
                class: "header",
                get: () => 'Zip Code',
                pos: [ {
                    s: "width:70px; min-width:70px"
                } ]
            }, {
                name: "field-8",
                component: __c_label,
                parent: "locs",
                class: "header",
                get: () => ''
            }, {
                name: "field-9",
                component: __c_label,
                parent: "locs",
                get: $$ => $$.index() + 1
            }, {
                name: "field-10",
                component: __c_editbox,
                parent: "locs",
                set: ($$, value) => ($$.set('.address1', value), $$.set('.addressLine', (value || '').toUpperCase())),
                atr: () => fields.simple('.address1', {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    maxlength: 50
                })
            }, {
                name: "field-11",
                component: __c_editbox,
                parent: "locs",
                atr: () => fields.simple('.city', {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    pattern: '[a-zA-Z ]{1,45}'
                })
            }, {
                name: "field-12",
                component: __c_dropdown,
                parent: "locs",
                atr: () => fields.choice('.state', cmn.statesPattern.split('|'), {
                    style: 'width: 45px; border-radius: 1px; height: 20px'
                })
            }, {
                name: "field-13",
                component: __c_editbox,
                parent: "locs",
                atr: () => fields.simple('.zip', [ [ '\\d{5}', 'Zip code is < 5 digits' ] ], {
                    style: 'width: calc(100% - 3px); border-radius: 1px; height: 18px',
                    pattern: '\\d{1,5}'
                })
            }, {
                name: "field-14",
                component: __c_button,
                parent: "locs",
                get: () => 'Delete',
                set: $$ => $$.detach()
            }, {
                name: "field-15",
                component: __c_button,
                parent: "root",
                get: () => 'Add additional location',
                set: $$ => $$.append('.location', this.locationDefaults)[0].append('.class')
            }, {
                name: "classes",
                component: __c_container,
                parent: "locs",
                get: $$ => $$('.class'),
                atr: $$ => ({
                    style: 'width: 100%;',
                    skip: $$('.class').length > 1 ? [] : [ 'field-23', 'field-31' ]
                }),
                pos: [ {
                    n: "Y",
                    w: "7"
                } ]
            }, {
                name: "field-38",
                component: __c_div,
                parent: "classes",
                class: "header",
                get: $$ => [ $$ ],
                pos: [ {
                    w: "7"
                } ]
            }, {
                name: "field-17",
                component: __c_label,
                parent: "classes",
                class: "header",
                get: () => '#',
                pos: [ {
                    n: "Y"
                } ]
            }, {
                name: "field-18",
                component: __c_label,
                parent: "classes",
                class: "header",
                get: () => 'Class Code'
            }, {
                name: "field-19",
                component: __c_label,
                parent: "classes",
                class: "header",
                get: () => '# F.T. Employees'
            }, {
                name: "field-20",
                component: __c_label,
                parent: "classes",
                class: "header",
                get: () => '# P.T. Employees'
            }, {
                name: "field-21",
                component: __c_label,
                parent: "classes",
                class: "header",
                get: () => '# Seasonal Employees'
            }, {
                name: "field-22",
                component: __c_label,
                parent: "classes",
                class: "header",
                get: () => 'Est. Annual Remuneration'
            }, {
                name: "field-23",
                component: __c_label,
                parent: "classes",
                class: "header",
                get: () => ''
            }, {
                name: "field-35",
                component: __c_div,
                parent: "locs",
                get: $$ => [ $$ ],
                atr: () => ({
                    style: 'background: #dcdcdc; padding: 2px'
                }),
                pos: [ {
                    n: "Y",
                    w: "6"
                } ]
            }, {
                name: "field-24",
                component: __c_button,
                parent: "field-35",
                get: () => 'Add additional class',
                set: $$ => $$.append('.class'),
                pos: [ {
                    colstyle: "display: inline;"
                } ]
            }, {
                name: "field-36",
                component: __c_button,
                parent: "field-35",
                get: () => 'Available class code list',
                set: $$ => this.showAvailable($$('..effective'), $$('.state')),
                pos: [ {
                    colstyle: "display: none;"
                } ]
            }, {
                name: "field-25",
                component: __c_label,
                parent: "classes",
                get: $$ => $$.index() + 1
            }, {
                name: "field-26",
                component: __c_editbox,
                parent: "classes",
                atr: () => fields.simple('.code', [ [ 0, 'Please enter class code' ], [ '\\d{4}' ] ], {
                    style: 'width: 50px; border-radius: 1px; height: 18px',
                    pattern: '\\d{1,4}'
                })
            }, {
                name: "field-27",
                component: __c_editbox,
                parent: "classes",
                atr: () => fields.simple('.fulltimeemployeeamt', {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: '\\d{1,3}'
                })
            }, {
                name: "field-28",
                component: __c_editbox,
                parent: "classes",
                atr: () => fields.simple('.parttimeemployeeamt', {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: '\\d{1,3}'
                })
            }, {
                name: "field-29",
                component: __c_editbox,
                parent: "classes",
                atr: () => fields.simple('.seasonalemployeeamt', [], {
                    style: 'width: 40px; border-radius: 1px; height: 18px',
                    pattern: '\\d{1,3}'
                })
            }, {
                name: "field-30",
                component: __c_editbox_$,
                parent: "classes",
                atr: () => fields.simple('.payroll', {
                    style: 'width: 80px; border-radius: 1px; height: 18px',
                    formatting: '99,999,999'
                })
            }, {
                name: "field-31",
                component: __c_button,
                parent: "classes",
                get: () => 'Delete',
                set: $$ => $$.detach(),
                pos: [ {
                    s: "max-width: 40px"
                } ]
            }, {
                name: "field-32",
                component: __c_radiolist,
                parent: "field-37",
                get: $$ => cmn.ajaxFeed($$, {
                    query: {
                        action: 'getSubcodes',
                        classCode: $$('.code'),
                        effectiveDate: $$('...effective') == 0 ? '20180303' : $$('...effective'),
                        lob: 'WORK',
                        state: $$('..state'),
                        method: 'WORKClassCodeScriptHelper'
                    },
                    param: {
                        value: $$('.subcode')
                    },
                    name: 'value',
                    mapper: v => ({
                        value: v.combined,
                        description: v.description
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
            }, {
                name: "field-39",
                component: __c_label,
                parent: "field-38",
                get: () => 'Class Informaton',
                atr: () => ({
                    style: 'background-color: #7e8083; color: #fff; font-size: 12px; text-align: center; font-weight: bold; display: block; line-height: 2em;'
                })
            }, {
                name: "field-37",
                component: __c_div,
                parent: "classes",
                get: $$ => $$('.code').length == 4 ? [ $$ ] : [],
                pos: [ {
                    n: "Y",
                    w: "7"
                } ]
            } ];
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
            ajaxCache.get({
                method: 'WORKClassCodeScriptHelper',
                action: 'getList',
                effectiveDate: effDt,
                list: 'classcode',
                lob: 'WORK',
                state: state
            }).then(data => {
                $('<div>').text(data.result.map(e => e.description).join('\n')).css('white-space', 'pre-wrap').dialog({
                    title: 'Available Class Code List',
                    width: 'auto',
                    height: 400,
                    close: function() {
                        $(this).dialog('destroy');
                    }
                });
            });
        }
        setup() {}
    }();
});