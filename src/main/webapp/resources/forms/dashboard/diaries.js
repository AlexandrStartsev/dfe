define([ "dfe-core", "dfe-common", "forms/dashboard/sortableheader", "forms/dashboard/common", "ui/utils", "ui/shapes", "dfe-field-helper", "ui/jquery", "components/label", "components/table", "components/div" ], function(Core, cmn, SortableHeaderForm, dashboardCommon, uiUtils, shapes, fields, jq, Label, Table, Div) {
    let Form = Core.Form; 
    let diariesRt = new Map();
    let columnNames = [ 'actionDate', 'appNumber', 'accountName', 'diarySubject', 'notes', 'createdByUser', 'creationDate', 'taskId' ];
    console.warn("DiaryForm.openTask --- on close refresh table");
    
    class DiaryForm extends Form {
        constructor(node) {
            super(node);
            node.unboundModel.defaultSubset('diary', {sortOrder: '.actionDate' });
        }
        static fields() {
            return Form.field(Div, "root", {
                get: $$ => $$('diary'),
                atr: $$ => ({
                    style: 'width: 100%;'
                })
            }, [ Form.field(Div, "loader", {
                get: function($$) {
                	DiaryForm.loadDiaries($$);
                	return [$$]
                }
            }, [ Form.field(Table, "diaries", {
                get: $$ => $$('.rows'),
                atr: $$ => ({
                    class: 'dashboard-table diaries-table',
                    order: dashboardCommon.makeSortFunction($$)
                })
            }, [ Form.field(Label, "field-1", {
                class: "header",
                get: $$ => 'Action Items (Diaries)',
                pos: [ {
                    w: "10",
                    s: "text-align: center"
                } ]
            }), Form.field(SortableHeaderForm, "h.actionDate", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Action Date', '.actionDate'),
            	pos: [ {
                    n: "Y"
                } ]
            }), Form.field(Label, "h.appNumber", {
                class: "header",
                get: $$ => 'QuoteId'
            }), Form.field(Label, "h.accountName", {
                class: "header",
                get: $$ => 'Account Name'
            }), Form.field(SortableHeaderForm, "h.diarySubject", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Subject', '.diarySubject')
            }), Form.field(Label, "h.notes", {
                class: "header",
                get: $$ => 'Notes'
            }), Form.field(Label, "h.createdByUser", {
                class: "header",
                get: $$ => 'Created By'
            }), Form.field(Label, "h.creationDate", {
                class: "header",
                get: $$ => 'Created Date'
            }), Form.field(Label, "h.taskId", {
                class: "header",
                get: $$ => 'Task Link'
            }), Form.field(Label, "actionDate", {
                get: $$ => $$('.actionDate').replace(/(\d{4})(\d{2})(\d{2})/,'$2/$3/$1')
            }), Form.field(Label, "appNumber", {
                atr: $$ => ({
                    html: `<a style="color: #59afe1" href="/DelegateWorkflow.do?workflowName=ShowWorkersCompApplication&quoteId=${$$('.appNumber')}">${$$('.appNumber')}</a>`
                })
            }), Form.field(Label, "accountName", {
                get: $$ => $$('.accountName')
            }), Form.field(Label, "diarySubject", {
                get: $$ => $$('.diarySubject')
            }), Form.field(Label, "notes", {
                get: $$ => $$('.notes')
            }), Form.field(Label, "createdByUser", {
                get: $$ => $$('.createdByUser')
            }), Form.field(Label, "creationDate", {
                get: $$ => $$('.creationDate').replace(/(\d{4})(\d{2})(\d{2})/,'$2/$3/$1')
            }), Form.field(Label, "taskId", {
                get: $$ => 'Edit',
                atr: $$ => ({
                    style: 'text-decoration: underline; cursor: pointer;',
                    events: {
                        onClick: () => DiaryForm.openTask($$('.taskId'), () => $$.node.parent.parent.update())
                    }
                })
            }) ]) ]) ])
        }
        static loadDiaries($$) {
            console.warn("loadDiaries return;");
            return ;
            jq.get('/AJAXServlet.srv?method=DashboardScriptHelper&action=diaries', function(data) {
                if (data && data.status == 'success') {
                	delete $$.data.rows;
                	data.result.forEach(d => {
                		d.actionDate = cmn.yyyymmdd(Date.parse(d.actionDate));
                		d.creationDate = cmn.yyyymmdd(Date.parse(d.creationDate));
                		$$.append('.rows', d);
                	});
                }
            });
        }
        static openTask(taskId, update) {
        	let map = diariesRt, ui = map.get(taskId);
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
    }
    
    function style(name, columns) {
        uiUtils.setDfeCustomStyle(`
            .diaries-table {
                width: 100%;
            }

            .diaries-table th {
                border-bottom: solid 2px white;
            }

            .diaries-table th > div {
                display: flex;
                justify-content: center;
            }

            .diaries-table td {
                text-align: center;
            }

            .diaries-table td:nth-child(8n+${columns.indexOf('accountName') + 1}),
            .diaries-table td:nth-child(8n+${columns.indexOf('diarySubject') + 1}),
            .diaries-table td:nth-child(8n+${columns.indexOf('notes') + 1}) {
                text-align: left;
            }            	
        `, name);
    }
    
    style(DiaryForm.name, columnNames );
    return DiaryForm;
})
