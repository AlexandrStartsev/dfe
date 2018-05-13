define([ "dfe-core", "forms/dashboard/sortableheader", "forms/dashboard/notes", "forms/dashboard/common", "ui/jquery-ui", "dfe-common", "ui/utils", "ui/shapes", "components/label", "components/table", "components/checkbox", "components/html" ], function(Core, SortableHeaderForm, NotesForm, dashboardCommon, jq, cmn, uiUtils, shapes, Label, Table, Checkbox, Html) {
    let Form = Core.Form;

    let noteRt = new Map();

    let DetailsGridForm = class extends Form {
        static fields(_, config) {
            return Form.field(Table, "rbody", {
                get: $$ => $$('.rows'),
                atr: $$ => ({
                    filter: config.rowFilterMaker($$),
                    skip: config.skipColumns,
                    class: 'dashboard-table ' + config.tableClass,
                    order: dashboardCommon.makeSortFunction($$)
                })
            }, [ Form.field(Label, "h.quoteid", {
                class: "header",
                get: $$ => 'QuoteId'
            }), Form.field(Label, "h.accountName", {
                class: "header",
                get: () => 'Account Name'
            }), Form.field(Label, "h.companyCode", {
                class: "header",
                get: () => 'Program'
            }), Form.field(SortableHeaderForm, "h.producerCode", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Producer Code', '.producerCode')
            }), Form.field(SortableHeaderForm, "h.effectiveDate", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Effective Date', '.effectiveDate')
            }), Form.field(SortableHeaderForm, "h.writtenPremium", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Written Premium', '.writtenPremium')
            }), Form.field(SortableHeaderForm, "h.govClass", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'GOV CC', '.govClass')
            }), Form.field(SortableHeaderForm, "h.grade", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Grade', '.grade')
            }), Form.field(SortableHeaderForm, "h.newRenewal", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Type', '.newRenewal')
            }), Form.field(Label, "h.notes", {
                class: "header",
                get: $$ => 'Notes'
            }), Form.field(SortableHeaderForm, "h.userId", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Assn. UW', '.userId')
            }), Form.field(Label, "h.reassign", {
                class: "header",
                get: $$ => 'Re-Assign'
            }), Form.field(Label, "quoteid", {
                atr: $$ => ({
                    html: `<a style="color: #59afe1" href="/DelegateWorkflow.do?workflowName=ShowWorkersCompApplication&quoteId=${$$('.quoteid')}">${$$('.quoteid')}</a>`
                })
            }), Form.field(Label, "accountName", {
                get: $$ => $$('.accountName')
            }), Form.field(Label, "companyCode", {
                get: $$ => $$('.companyCode')
            }), Form.field(Label, "producerCode", {
                get: $$ => $$('.producerCode')
            }), Form.field(Label, "effectiveDate", {
                get: function($$) {
                    let v = $$('.effectiveDate');
                    if (typeof v == 'string') return v.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');
                }
            }), Form.field(Label, "writtenPremium", {
                get: function($$) {
                    let v = $$('.writtenPremium');
                    if (typeof v == 'string') return v.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
                }
            }), Form.field(Label, "govClass", {
                get: $$ => $$('.govClass')
            }), Form.field(Label, "grade", {
                get: $$ => $$('.grade')
            }), Form.field(Label, "newRenewal", {
                get: $$ => $$('.newRenewal')
            }), Form.field(Html, "notes", {
                get: $$ => shapes.svgShape($$, 'svg-icon-file-text'),
                atr: $$ => ({
                    style: `opacity: ${DetailsGridForm.firstUserNote($$) ? 1 : .3}; cursor: pointer;`,
                    events: {
                        onClick: () => DetailsGridForm.showNotes($$)
                    }
                })
            }), Form.field(Label, "userId", {
            	get: $$ => $$('.userId')
            }), Form.field(Checkbox, "reassign", {
            	get: $$ => $$('.reassign'),
            	set: ($$, value) => $$.set('.reassign', value)
            }) ])
        }
        static firstUserNote(row) {
            let user = row.get('currentUser');
            return row.get('.note').filter(n => n.get('.user') == user && n.get('.subject') != 0).pop();
        }
        static showNotes($$) {
            let qid = $$('.quoteid'), map = noteRt, rt = map.get(qid);
            if (!rt) {
                map.set(qid, rt = Core.startRuntime({
                    form: NotesForm,
                    model: $$,
                    node: jq('<div>').dialog({
                        title: 'Notes for quote #' + $$.get('.quoteid'),
                        width: 400,
                        height: 200,
                        close: function() {
                            rt.shutdown();
                            jq(this).dialog('destroy');
                            map.delete(qid);
                            let json = JSON.stringify($$.get('.note').filter(n => {
                                if (n.get('.isnew') != 0) {
                                    n.set('.isnew');
                                    let s = n.get('.subject');
                                    s == 0 && n.detach();
                                    return s != 0;
                                }
                            }).map(n => n.data));
                            json == '[]' || jq.get(`/AJAXServlet.srv?method=DashboardScriptHelper&action=saveNotes&quoteId=${qid}&data=${encodeURIComponent(json)}`);
                        }
                    })[0]
                }));
            } else {
                jq(rt.nodes[0].$parentDom).dialog('moveToTop');
            }
        }
    }
    
    function setupNotesHint() {
        jq(document).on('mousemove', function(e) {
            let c = jq('.dashboard-quotes-popup'), p = c.parent()[0], t = e.target, node = Core.nodeFromElement(t);
            p && p != t && (!jq.contains(p, t) || e.target.tagName != 'LABEL') && c.remove();
            if ( node && c.parent().length === 0 && node.form instanceof DetailsGridForm ) {
                let $$ = node.model, text = '', fld = node.field.name;
                if (fld == 'producerCode') text = $$('.producerName');
                if (fld == 'govClass') text = $$('.govCCDescription');
                if (fld == 'notes') ($$ = DetailsGridForm.firstUserNote($$)) && (text = $$.get('.subject'));
                text && jq('<label>').appendTo(jq('<div>').appendTo(jq(t)).attr({
                    class: 'dashboard-quotes-popup'
                })).text(text);
            }
        });
    }
    setupNotesHint();
    
    uiUtils.setDfeCustomStyle(` 
        .ui-widget-header{
            background: #97a47a;
            color: #fff;
        }

        .ui-dialog .ui-dialog-content{
            text-align: left; 
            padding: 4px;
        }

        .dashboard-quotes-popup {
            position: absolute;
        }

        .dashboard-quotes-popup > label {
            display: block;
            position: relative;
            opacity: 0.9;
            background: antiquewhite;
            padding: 5px 10px;
            border-radius: 7px;
            box-shadow: 2px 2px lightgrey;
            z-index: 100;
            top: -5px;
            left: -100px;
            width: 120px;
        }
    `, DetailsGridForm.name);
    
    return DetailsGridForm;
})