defineForm([ "require", "ui/utils", "dfe-core", "dfe-common", "components/div", "components/label", "components/editbox", "components/button", "components/table", "components/form", "dfe-field-helper", "components/dropdown", "ui/jquery-ui", "components/html" ], function(require, uiUtils, Core, cmn, Div, Label, Editbox, Button, Table, HtmlForm, fields, Dropdown, jQuery, Html) {
    let Form = Core.Form;
    
    class RatingTableExpirationForm extends Form {
        constructor(node) {
            super(node);
            node.unboundModel.append('expirations', { edit: 'Y' });
        }
        static fields() {
            return Form.field(Div, "root", {
                atr: () => ({
                    style: 'display: table; background-color: white; width: 900px; position: relative'
                })
            }, [ Form.field(HtmlForm,"form", {
                atr: () => ({
                    method: 'POST',
                    name: 'ratingTableEpirationsHtmlForm'
                })
            }, [ Form.field(Table, "field-1", {
                get: $$ => $$('expirations'),
                atr: () => ({
                    class: 'expirations-table'
                })
            }, [ Form.field(Label, "field-3", {
                class: "header",
                get: $$ => 'Company'
            }), Form.field(Label, "field-4", {
                class: "header",
                get: $$ => 'Expiration Date'
            }), Form.field(Label, "field-5", {
                class: "header",
                get: $$ => 'Comment'
            }), Form.field(Label, "field-6", {
                class: "header",
                get: $$ => 'Action'
            }), Form.field(Dropdown, "field-2", {
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
            }), Form.field(Editbox, "field-7", {
                atr: $$ => fields.date('.expirationDate', {
                    type: 'datepicker',
                    ...$$('.edit') == 'Y' ? {
                        name: 'expDt'
                    } : {
                        disabled: true
                    }
                })
            }), Form.field(Editbox, "field-8", {
                atr: $$ => fields.simple('.comment', {
                    style: 'width: 400px',
                    disabled: $$('.edit') != 'Y'
                })
            }), Form.field(Button,"field-9", {
                get: $$ => $$('.edit') == 'Y' ? 'Add' : 'Remove',
                set: ($$, value) => {
                    //let runtime = $$.runtime, form = runtime.findControls("form").shift();
                    let form = document.querySelector('[name="ratingTableEpirationsHtmlForm"]');
                    let formNode = Core.nodeFromElement(form);
                    let runtime = formNode.runtime;
                    if ($$('.edit') == 'Y') {
                        runtime.notifyControls(runtime.findChildren(formNode), 'validate');
                        $$('..').set({
                            action: 'add',
                            cmnt: $$('.comment')
                        });
                        runtime.schedule.push(() => formNode.erroringControls.size || form.submit());
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
                                    runtime.schedule.push(() => form.submit());
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
                layout: [ {
                    style: "text-align: center"
                } ]
            }) ]), Form.field(Editbox, "action", {
                get: $$ => $$('action'),
                atr: () => ({
                    name: 'action',
                    type: 'hidden'
                })
            }), Form.field(Editbox, "id", {
                get: $$ => $$('id'),
                atr: () => ({
                    name: 'id',
                    type: 'hidden'
                })
            }), Form.field(Editbox, "cmnt", {
                get: $$ => $$('cmnt'),
                atr: () => ({
                    name: 'cmnt',
                    type: 'hidden'
                })
            }) ]), Form.field(Div, "changelog", [
            Form.field(Html, "field-10", {
                get: () => '<h3>Change Log:</h3>'
            }), Form.field(Table, "field-11", {
                get: $$ => $$('changelog'),
                atr: $$ => ({
                    class: 'changelog-table',
                    style: 'width: 90%'
                })
            }, [ Form.field(Label, "field-13", {
                class: "header",
                get: $$ => 'Insert Date'
            }), Form.field(Label, "field-14", {
                class: "header",
                get: $$ => 'User'
            }), Form.field(Label, "field-15", {
                class: "header",
                get: $$ => 'Company'
            }), Form.field(Label, "field-16", {
                class: "header",
                get: $$ => 'Expiration Date'
            }), Form.field(Label, "field-17", {
                class: "header",
                get: $$ => 'Comment'
            }), Form.field(Label, "field-18", {
                class: "header",
                get: $$ => 'Action'
            }), Form.field(Label, "field-12", {
                get: $$ => $$('.entryDate').replace(/^0|(\/)0/g, '$1'),
                layout: [ {
                    style: "text-align: center"
                } ]
            }), Form.field(Label, "field-19", {
                get: $$ => $$('.userName')
            }), Form.field(Label, "field-20", {
                get: $$ => {
                    let code = $$('.companyCode');
                    return $$('companies').map(c => c.data).filter(c => c.companyCode === code).map(c => c.stateCode + ' - ' + c.companyShortName).pop() || code;
                }
            }), Form.field(Label, "field-21", {
                get: $$ => $$('.expirationDate').replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1'),
                layout: [ {
                    style: "text-align: center"
                } ]
            }), Form.field(Label, "field-22", {
                get: $$ => $$('.comment'),
                layout: [ {
                    style: "width: 300px"
                } ]
            }), Form.field(Label, "field-23", {
                get: $$ => $$('.action'),
                layout: [ {
                    style: "text-align: center"
                } ]
            }) ]) ]) ]);
        }
    }
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
    `, RatingTableExpirationForm.name);
    return RatingTableExpirationForm;
})