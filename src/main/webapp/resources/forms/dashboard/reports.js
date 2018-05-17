define([ "dfe-core", "dfe-common", "forms/dashboard/common", "ui/utils", "ui/shapes", "dfe-field-helper", "ui/jquery-ui", "components/div", "components/div-button", "components/tab-s", "components/iframe", "components/button", "components/label", "components/html" ], function(Core, cmn, dashboardCommon, uiUtils, shapes, fields, jq, Div, DivButton, TabS, Iframe, Button, Label, Html) {
    let Form = Core.Form;
    class ReportsForm extends Form{
        constructor(node) {
            super(node)
            let $$ = node.unboundModel;
            if (window.clipboardData) {
                // Only essentially works in IE.
                let clipboard = window.clipboardData.getData('Text'), pattern = /^http.+ItemPath=([^&]+).*$/;
                this.clipBoardWatch || (this.clipBoardWatch = setInterval(() => {
                    let newCb = window.clipboardData.getData('Text');
                    if (newCb !== clipboard && newCb.match(pattern)) {
                        let link = clipboard = newCb;
                        let desc = link.replace(pattern, '$1').replace(/%2f/g, '/').replace(/\+/g, ' ');
                        ReportsForm.editLink($$.shadow('reports', {
                            ReportDesc: desc,
                            ReportLink: link
                        }).shift());
                    }
                }, 1e3));
            }
        }
        static fields() {
            return Form.field(Div, "root", {
                atr: $$ => ({
                    wrap: true,
                    style: 'width: 100%;'
                })
            }, [ Form.field(TabS, "field-1", {
                get: $$ => $$.get('reports').concat($$.shadow('reports')),
                atr: $$ => ({
                    haclass: 'tab-report-active',
                    focusnew: false,
                    style: 'display: flex; flex-flow: row; position: relative'
                })
            }, [ Form.field(Div, "header", {
                atr: $$ => ({
                    wrap: true,
                    style: 'display: flex;'
                }),
                layout: [ {
                    class: "tab-report-header"
                } ]
            }, [ Form.field(Html,"field-5", {
                get: $$ => shapes.cssShape($$, $$.isShadow() ? 'css-button-plus' : 'css-button-dotted'),
                atr: $$ => ({
                    class: $$.get('.default') == 0 ? 'reportrow-edit-button' : 'reportrow-edit-button-fixed',
                    events: {
                        onClick: e => {
                            ReportsForm.editLink($$);
                            e.stopPropagation();
                        }
                    }
                })
            }), Form.field(Label, "field-6", {
                get: $$ => $$.get('.ReportDesc'),
                layout: [{class: 'link-button', style: 'margin: 3px'}]
            }) ]),
                Form.field(Div, {atr: () => ({wrap: true}), layout: [{class: 'tab-report-content'}]},
                Form.field(Iframe, "field-3", {
                    get: $$ => $$.get('.ReportLink'),
                    atr: $$ => ({
                        wrap: true,
                        style: 'width: 100%; height: 100%; border: 1px solid #aaa; border-radius: 5px'
                    })
                }), 
                Form.field(Label, "field-4", {
                    get: $$ => window.clipboardData && '*Right-click on item > copy shortcut to open add new report link suggestion window',
                    atr: $$ => ({
                        style: 'margin-top: 2px; font-size: 10px'
                    }),
                    layout: [ {
                        style: "float: right"
                    } ]
                }) )
            ]) ]);
        }
        static editLink($$) {
            let store = () => jq.get('/AJAXServlet.srv?method=DashboardScriptHelper&action=updateReports&payload=' + encodeURIComponent(JSON.stringify($$.get('reports').map(px => px.data))));
            let buttons = {}, descEdit = jq('<input>'), linkEdit = jq('<input>'), desc = $$.get('.ReportDesc'), link = $$.get('.ReportLink');
            descEdit.attr('spellcheck', 'false').val(desc == 0 ? '<Report Description>' : desc);
            linkEdit.attr('spellcheck', 'false').val(link == 0 ? 'http://' : link);
            buttons[$$.isShadow() ? "Add" : "Save"] = function() {
                $$.set({
                    ReportDesc: descEdit.val(),
                    ReportLink: linkEdit.val()
                });
                store();
                $(this).dialog('destroy');
            };
            if (!$$.isShadow()) buttons.Delete = function() {
                $$.detach();
                store();
                $(this).dialog('destroy');
            };
            buttons.Cancel = function() {
                $(this).dialog('destroy');
            };
            jq('<div>').dialog({
                title: $$.isShadow() ? 'Add new link' : 'Modify or delete link',
                modal: true,
                resizable: false,
                width: 700,
                height: 170,
                close: function() {
                    jq(this).dialog('destroy');
                },
                buttons: buttons
            }).append(descEdit).append(linkEdit).parent().toggleClass('edit-report-link');
            descEdit.focus();
            descEdit.prop({
                selectionStart: 0,
                selectionEnd: 999
            });
        }
    }
    function style(name) {
        uiUtils.setDfeCustomStyle(`
            div.edit-report-link > div.ui-dialog-content > input {
                display: flex;
                font-size: 16px;
                border-radius: 5px;
                width: 100%;
                height: 25px;
                background: #f7f7f7;
            }

            div.edit-report-link > div.ui-dialog-content {
                display: flex!Important;
                flex-flow: column;
                justify-content: space-around;
            }

            div.edit-report-link {
                background: #dee2dc;
            }

            div.edit-report-link .ui-dialog-buttonpane {
                margin: 0px;
                padding: 0px;
                background: #dee2dc;
                border: 1px solid #bbb;
                border-width: 1px 0 0 0;
            }

            .tab-report-active {
                background: #f9e5bf;
                border-radius: 3px;
            }

            .tab-report-content {
                width: 100%;
                height: 750px;
                margin: 2px 4px 4px 5px;
            }

            .tab-report-header {
                min-width: 170px;
                margin: 2px;
                cursor: pointer;
                padding: 2px 5px 2px 5px;
            }

            .tab-report-header:active:not(:last-child) {
                background-color: grey;
                transform: translateY(1px);
            }

            .tab-report-header:last-child {
                pointer-events: none;
            }

            span.reportrow-edit-button {
                width: 12px; 
                height: 12px;
                pointer-events: all;
            }

            span.reportrow-edit-button-fixed {
                width: 12px; 
                height: 12px;
                pointer-events: none; 
                visibility: hidden;
            }

        `, name);
    }
    style(ReportsForm.name);
    return ReportsForm;
})