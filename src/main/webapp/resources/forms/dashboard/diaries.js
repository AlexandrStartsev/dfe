defineForm("dashboard/diaries", [ "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "ui/jquery", "components/label", "components/container", "components/div" ], function(cmn, uiUtils, shapes, fields, jq, __c_label, __c_container, __c_div) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    style: 'width: 100%;'
                })
            }, [ __c_container("diaries", {
                get: $$ => this.loadDiaries($$),
                atr: $$ => ({
                    class: 'diaries-table'
                })
            }, [ __c_label("field-1", {
                class: "header",
                get: $$ => 'Action Items (Diaries)',
                pos: [ {
                    w: "8"
                } ]
            }), __c_label("field-2", {
                class: "header",
                get: $$ => 'QuoteId',
                pos: [ {
                    n: "Y"
                } ]
            }), __c_label("field-3", {
                class: "header",
                get: $$ => 'Account Name'
            }), __c_label("field-4", {
                class: "header",
                get: $$ => 'Subject'
            }), __c_label("field-5", {
                class: "header",
                get: $$ => 'Notes'
            }), __c_label("field-6", {
                class: "header",
                get: $$ => 'Action Date'
            }), __c_label("field-7", {
                class: "header",
                get: $$ => 'Created By'
            }), __c_label("field-8", {
                class: "header",
                get: $$ => 'Created Date'
            }), __c_label("field-9", {
                class: "header",
                get: $$ => 'Task Link'
            }), __c_label("field-10", {
                get: $$ => `<a style="color: #59afe1" href="/DelegateWorkflow.do?workflowName=ShowWorkersCompApplication&quoteId=${$$('.appNumber')}">${$$('.appNumber')}</a>`,
                atr: $$ => ({
                    html: true,
                    class: 'label-centered'
                })
            }), __c_label("field-11", {
                get: $$ => $$('.accountName')
            }), __c_label("field-12", {
                get: $$ => $$('.diarySubject')
            }), __c_label("field-13", {
                get: $$ => $$('.notes')
            }), __c_label("field-14", {
                get: $$ => cmn.mmddyyyy(Date.parse($$('.actionDate')),'/') 
            }), __c_label("field-15", {
                get: $$ => $$('.createdByUser')
            }), __c_label("field-16", {
                get: $$ => cmn.mmddyyyy(Date.parse($$('.creationDate')),'/')
            }), __c_label("field-17", {
                get: $$ => 'Edit',
                atr: $$ => ({
                    style: 'text-decoration: underline; cursor: pointer;',
                    events: {
                        click: () => this.openTask($$('.taskId'), () => $$.control.parentControl.notifications.push({
                            action: 'self'
                        }))
                    }
                }),
                pos: [ {
                    s: "display: block; text-align: center;"
                } ]
            }) ]) ]);
        }
        loadDiaries($$) {
            jq.get('/AJAXServlet.srv?method=DashboardScriptHelper&action=diaries', function(data) {
                if (data && data.status == 'success') {
                    $$.result(data.result);
                    $$.runtime.processInterceptors();
                }
            });
        }
        openTask(taskId, update) {
            var url = `/tools/commercial/workerscomp/diaryFollowupTaskEdit.jsp?taskId=${taskId}&diaryContext=UNSPECIFIED&saveSuccess=N`;
            var popupWin = window.open(url, 'DiaryFollowup', 'scrollbars=yes,toolbar=no,height=600,width=650');
            window.diaryFollowUpEdit.onsavesuccess = update;
            window.focus && popupWin.focus();
        }
        setup() {
        	window.diaryFollowUpEdit = {};
            uiUtils.setDfeCustomStyle(`
            	.diaries-table {
            		width: 100%;
            		border-collapse: separate;
            	}
            	
            	.diaries-table th {
            		border-right: none;
            	}
            `, this.name);
        }
    }();
});