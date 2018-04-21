defineForm([ "dfe-common", "forms/dashboard/common", "ui/utils", "ui/shapes", "dfe-field-helper", "ui/jquery-ui", "components/div", "components/div-button", "components/tab-s", "components/editbox", "components/iframe", "components/button", "components/label", "components/html" ], function(cmn, dashboardCommon, uiUtils, shapes, fields, jq, __c_div, __c_div_button, __c_tab_s, __c_editbox, __c_iframe, __c_button, __c_label, __c_html) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    style: 'width: 100%;'
                })
            }, [ __c_tab_s("field-1", {
                get: $$ => $$('reports').concat($$.shadow('reports')),
                atr: $$ => ({
                    hfield: 'field-2',
                    haclass: 'tab-report-active',
                    rowclass: 'tab-report-content',
                    focusnew: false,
                    style: 'display: flex; flex-flow: row; position: relative'
                })
            }, [ __c_div("field-2", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    style: 'display: flex;'
                }),
                pos: [ {
                    colclass: "tab-report-header"
                } ]
            }, [ __c_html("field-5", {
                get: $$ => shapes.cssShape($$, $$.isShadow() ? 'css-button-plus' : 'css-button-dotted'),
                atr: $$ => ({
                    class: $$('.default') == 0 ? 'reportrow-edit-button' : 'reportrow-edit-button-fixed',
                    events: {
                        click: e => {
                            this.editLink($$);
                            e.stopPropagation();
                        }
                    }
                })
            }), __c_label("field-6", {
                get: $$ => $$('.ReportDesc'),
                atr: $$ => ({
                    class: 'link-button'
                })
            }) ]), __c_iframe("field-3", {
                get: $$ => $$('.ReportLink'),
                atr: $$ => ({
                    style: 'width: 100%; height: 100%; border: 1px solid #aaa; border-radius: 5px'
                })
            }), __c_label("field-4", {
                get: $$ => window.clipboardData && '*Right-click on item > copy shortcut to open add new report link suggestion window',
                atr: $$ => ({
                    style: 'margin-top: 2px; font-size: 10px'
                }),
                pos: [ {
                    colstyle: "float: right"
                } ]
            }) ]) ]);
        }
        onstart($$) {
            if (window.clipboardData) {
                // Only essentially works in IE.
                let clipboard = window.clipboardData.getData('Text'), pattern = /^http.+ItemPath=([^&]+).*$/;
                this.clipBoardWatch || (this.clipBoardWatch = setInterval(() => {
                    let newCb = window.clipboardData.getData('Text');
                    if (newCb !== clipboard && newCb.match(pattern)) {
                        let link = clipboard = newCb;
                        let desc = link.replace(pattern, '$1').replace(/%2f/g, '/').replace(/\+/g, ' ');
                        this.editLink($$.shadow('reports', {
                            ReportDesc: desc,
                            ReportLink: link
                        }).shift());
                    }
                }, 1e3));
            }
        }
        editLink($$) {
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
        setup() {
            this.style();
        }
        style() {
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
                
                div.reportrow-edit-button {
            		width: 12px; 
            		height: 12px; 
            		margin: 3px;
            		pointer-events: all;
                }
                
                div.reportrow-edit-button-fixed {
            		width: 12px; 
            		height: 12px; 
            		margin: 3px;
            		pointer-events: none; 
            		visibility: hidden;
                }
                
            `, this.name);
        }
    }();
});