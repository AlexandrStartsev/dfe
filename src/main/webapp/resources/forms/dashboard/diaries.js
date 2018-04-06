defineForm("dashboard/diaries", [ "dfe-common", "forms/dashboard/sortableheader", "forms/dashboard/common", "ui/utils", "ui/shapes", "dfe-field-helper", "ui/jquery", "components/label", "components/html", "components/container", "components/div" ], function(cmn, __f_sortableheader, dashboardCommon, uiUtils, shapes, fields, jq, __c_label, __c_html, __c_container, __c_div) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => $$('diary'),
                atr: $$ => ({
                    style: 'width: 100%;'
                })
            }, [ __c_div("loader", {
                get: function($$) {
                	this.loadDiaries($$);
                	return [$$]
                }
            }, [ __c_container("diaries", {
                get: $$ => $$('.rows'),
                atr: $$ => ({
                    class: 'diaries-table',
                    order: dashboardCommon.makeSortFunction($$)
                })
            }, [ __c_label("field-1", {
                class: "header",
                get: $$ => 'Action Items (Diaries)',
                pos: [ {
                    w: "10",
                    s: "text-align: center"
                } ]
            }), __f_sortableheader("h.actionDate", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Action Date', '.actionDate'),
            	pos: [ {
                    n: "Y"
                } ]
            }), __c_label("h.appNumber", {
                class: "header",
                get: $$ => 'QuoteId'
            }), __c_label("h.accountName", {
                class: "header",
                get: $$ => 'Account Name'
            }), __f_sortableheader("h.diarySubject", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Subject', '.diarySubject')
            }), __c_label("h.notes", {
                class: "header",
                get: $$ => 'Notes'
            }), __c_label("h.createdByUser", {
                class: "header",
                get: $$ => 'Created By'
            }), __c_label("h.creationDate", {
                class: "header",
                get: $$ => 'Created Date'
            }), __c_label("h.taskId", {
                class: "header",
                get: $$ => 'Task Link'
            }), __c_label("actionDate", {
                get: $$ => cmn.mmddyyyy(Date.parse($$('.actionDate')), '/')
            }), __c_label("appNumber", {
                get: $$ => `<a style="color: #59afe1" href="/DelegateWorkflow.do?workflowName=ShowWorkersCompApplication&quoteId=${$$('.appNumber')}">${$$('.appNumber')}</a>`,
                atr: $$ => ({
                    html: true
                })
            }), __c_label("accountName", {
                get: $$ => $$('.accountName')
            }), __c_label("diarySubject", {
                get: $$ => $$('.diarySubject')
            }), __c_label("notes", {
                get: $$ => $$('.notes')
            }), __c_label("createdByUser", {
                get: $$ => $$('.createdByUser')
            }), __c_label("creationDate", {
                get: $$ => cmn.mmddyyyy(Date.parse($$('.creationDate')), '/')
            }), __c_label("taskId", {
                get: $$ => 'Edit',
                atr: $$ => ({
                    style: 'text-decoration: underline; cursor: pointer;',
                    events: {
                        click: () => this.openTask($$('.taskId'), () => $$.control.parentControl.parentControl.notifications.push({
                            action: 'self'
                        }))
                    }
                })
            }) ]) ]) ]);
        }
        onstart($$) {
            $$.defaultSubset('diary', {sortOrder: '.actionDate' });
        }
        loadDiaries($$) {
            jq.get('/AJAXServlet.srv?method=DashboardScriptHelper&action=diaries', function(data) {
                if (data && data.status == 'success') {
                	delete $$.data.rows;
                	data.result.forEach(d => $$.append('.rows', d));
                }
            });
        }
        openTask(taskId, update) {
        	let map = this.diariesRt, ui = map.get(taskId);
        	if(!ui) {
        		let url = `/tools/commercial/workerscomp/diaryFollowupTaskEdit.jsp?taskId=${taskId}&diaryContext=UNSPECIFIED&saveSuccess=N`;
        		let ov = jq('<div>').attr({class: 'loading-overlay'}).css({top: '40px', left: '0px', display: 'flex', height: 'calc(100% - 40px)'}), cb;
        		(cb = e => e && ov[0].appendChild(e))(shapes.cssShape({ result: cb }, 'css-loading-anim-circle'));
        		map.set(taskId, ui = jq('<iframe>').attr({src: url}).dialog({
	                title: 'Diary task #' + taskId,
	                width: 655,
	                height: 560,
	                resizable: false,
	                close: function() {
	                	map.delete(taskId);
                        jq(this).dialog('destroy');
	                }}).css({width: "100%"}).load(() => ov.remove()));
        		window.diaryFollowUpEdit.onsavesuccess = update;
        		ov.appendTo(ui.parent());
        	} else {
        		ui.dialog('moveToTop');
        	}
        }
        setup() {
        	this.diariesRt = new Map();
            window.diaryFollowUpEdit = {};
            
            this.style(this.name, [ 'actionDate', 'appNumber', 'accountName', 'diarySubject', 'notes', 'createdByUser', 'creationDate', 'taskId' ]);
        }
        style(name, columns) {
            uiUtils.setDfeCustomStyle(`
            	.diaries-table {
            		width: 100%;
            		border-collapse: collapse;
            	}
            	
            	.diaries-table th {
            		background-color: #97a47a;
    		        border-right: solid 2px white;
    		        border-bottom: solid 2px white;
            		text-align: center;
            		color: white;
            		padding: 2px 15px 2px 15px;
            	}
            	
                .diaries-table th > div {
                    display: flex;
                    justify-content: center;
                }
                
            	.diaries-table th > label {
    		        white-space: nowrap;
            	}                
            	
            	.diaries-table td {
            		text-align: center;
            	}
            	
            	.diaries-table td:nth-child(8n+${columns.indexOf('accountName') + 1}),
            	.diaries-table td:nth-child(8n+${columns.indexOf('diarySubject') + 1}),
            	.diaries-table td:nth-child(8n+${columns.indexOf('notes') + 1}) {
            		text-align: left;
            	}            	
            `, this.name);
        }
    }();
});
