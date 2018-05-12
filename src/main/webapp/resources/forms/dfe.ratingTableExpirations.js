defineForm([ "require", "ui/utils", "dfe-core", "dfe-common", "components/div", "components/label", "components/editbox", "components/button", "components/container", "components/form", "dfe-field-helper", "components/dropdown", "ui/jquery-ui", "components/html" ], function(require, uiUtils, core, cmn, __c_div, __c_label, __c_editbox, __c_button, __c_container, __c_form, fields, __c_dropdown, jQuery, __c_html) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => [ $$ ],
                atr: () => ({
                    style: 'display: table; background-color: white; width: 900px; position: relative'
                })
            }, [ __c_form("form", {
                get: $$ => [ $$ ],
                atr: () => ({
                    method: 'POST'
                })
            }, [ __c_container("field-1", {
                get: $$ => $$('expirations'),
                atr: () => ({
                    class: 'expirations-table'
                })
            }, [ __c_label("field-3", {
                class: "header",
                get: $$ => 'Company'
            }), __c_label("field-4", {
                class: "header",
                get: $$ => 'Expiration Date'
            }), __c_label("field-5", {
                class: "header",
                get: $$ => 'Comment'
            }), __c_label("field-6", {
                class: "header",
                get: $$ => 'Action'
            }), __c_dropdown("field-2", {
                get: function($$) {
                    let desc, descs = {};
                    let companies = $$('companies').map(row => row.data).map(company => ({
                        value: company.companyCode,
                        description: (desc = company.stateCode + ' - ' + company.companyShortName, descs[desc] = descs[desc] ? 2 : 1, 
                        desc)
                    })).map(company => ({
                        value: company.value,
                        description: company.description + (descs[company.description] == 2 ? ' (' + company.value + ')' : '')
                    })).sort((c1, c2) => c1.description.localeCompare(c2.description));
                    return {
                        value: $$('.companyCode'),
                        items: [ {
                            value: '',
                            description: 'Please select...'
                        } ].concat(companies)
                    };
                },
                set: ($$, value) => $$.set('.companyCode', value),
                val: $$ => $$.required('.companyCode'),
                atr: $$ => ({
                    style: 'width: 200px',
                    ...$$('.edit') == 'Y' ? {
                        name: 'compCd'
                    } : {
                        disabled: true
                    }
                })
            }), __c_editbox("field-7", {
                atr: $$ => fields.date('.expirationDate', {
                    type: 'datepicker',
                    ...$$('.edit') == 'Y' ? {
                        name: 'expDt'
                    } : {
                        disabled: true
                    }
                })
            }), __c_editbox("field-8", {
                atr: $$ => fields.simple('.comment', {
                    style: 'width: 400px',
                    disabled: $$('.edit') != 'Y'
                })
            }), __c_button("field-9", {
                get: $$ => $$('.edit') == 'Y' ? 'Add' : 'Remove',
                set: ($$, value) => {
                    let runtime = $$.runtime, form = runtime.findControls("form").shift();
                    if ($$('.edit') == 'Y') {
                        runtime.notifyControls(runtime.findChildren(form), 'validate');
                        $$('..').set({
                            action: 'add',
                            cmnt: $$('.comment')
                        });
                        runtime.schedule.push(() => form.erroringControls.size || form.ui.submit());
                    } else {
                        let ui = jQuery('<div>'), edit = jQuery('<textarea>').appendTo(ui), close = () => ui.dialog('destroy');
                        let handler = () => ui.parent().find('button:contains("OK")').attr({
                            disabled: !edit.val()
                        });
                        edit.css({
                            width: '100%',
                            height: '100px',
                            resize: 'none',
                            borderRadius: '2px'
                        });
                        ui.css({
                            padding: '2px',
                            width: '100%'
                        });
                        ui.dialog({
                            title: 'Comment',
                            modal: true,
                            resizable: false,
                            close: close,
                            buttons: {
                                OK: () => {
                                    $$('..').set({
                                        action: 'update',
                                        id: $$('.expirationId'),
                                        cmnt: edit.val()
                                    });
                                    runtime.schedule.push(() => form.ui.submit());
                                    close();
                                },
                                Cancel: () => close()
                            }
                        });
                        edit.on('keyup', handler);
                        handler();
                    }
                },
                atr: $$ => ({
                    class: 'link-button'
                }),
                pos: [ {
                    s: "text-align: center"
                } ]
            }) ]), __c_editbox("action", {
                get: $$ => $$('action'),
                atr: () => ({
                    name: 'action',
                    type: 'hidden'
                })
            }), __c_editbox("id", {
                get: $$ => $$('id'),
                atr: () => ({
                    name: 'id',
                    type: 'hidden'
                })
            }), __c_editbox("cmnt", {
                get: $$ => $$('cmnt'),
                atr: () => ({
                    name: 'cmnt',
                    type: 'hidden'
                })
            }) ]), __c_div("changelog", {
                get: $$ => [ $$ ]
            }, [ __c_html("field-10", {
                get: () => '<h3>Change Log:</h3>'
            }), __c_container("field-11", {
                get: $$ => $$('changelog'),
                atr: $$ => ({
                    class: 'changelog-table',
                    style: 'width: 90%'
                })
            }, [ __c_label("field-13", {
                class: "header",
                get: $$ => 'Insert Date'
            }), __c_label("field-14", {
                class: "header",
                get: $$ => 'User'
            }), __c_label("field-15", {
                class: "header",
                get: $$ => 'Company'
            }), __c_label("field-16", {
                class: "header",
                get: $$ => 'Expiration Date'
            }), __c_label("field-17", {
                class: "header",
                get: $$ => 'Comment'
            }), __c_label("field-18", {
                class: "header",
                get: $$ => 'Action'
            }), __c_label("field-12", {
                get: $$ => $$('.entryDate').replace(/^0|(\/)0/g, '$1'),
                pos: [ {
                    s: "text-align: center"
                } ]
            }), __c_label("field-19", {
                get: $$ => $$('.userName')
            }), __c_label("field-20", {
                get: $$ => {
                    let code = $$('.companyCode');
                    return $$('companies').map(c => c.data).filter(c => c.companyCode === code).map(c => c.stateCode + ' - ' + c.companyShortName).pop() || codefunction($$);
                }
            }), __c_label("field-21", {
                get: $$ => $$('.expirationDate').replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1'),
                pos: [ {
                    s: "text-align: center"
                } ]
            }), __c_label("field-22", {
                get: $$ => $$('.comment'),
                pos: [ {
                    s: "width: 300px"
                } ]
            }), __c_label("field-23", {
                get: $$ => $$('.action'),
                pos: [ {
                    s: "text-align: center"
                } ]
            }) ]) ]) ]);
        }
        onstart($$) {
            $$.append('expirations', {
                edit: 'Y'
            });
        }
        setup() {
            uiUtils.setDfeCustomStyle(`
                input[disabled]{
            		background: white;
                }
                button.ui-button[disabled] {
				    opacity: .5;
				    cursor: default!Important;
				}
				table.expirations-table {
				    border-collapse: collapse;
				}
				table.changelog-table {
				    border: 1px solid #888;
				    border-collapse: collapse;
				}
				table.changelog-table td, table.changelog-table th, table.expirations-table th {
				    border: 1px solid #888;
				    padding: 2px;
				}
            `, this.name);
        }
    }();
});