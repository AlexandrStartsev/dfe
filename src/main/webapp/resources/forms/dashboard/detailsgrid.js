defineForm([ "dfe-core", "forms/dashboard/notes", "forms/dashboard/sortableheader", "forms/dashboard/common", "ui/jquery-ui", "dfe-common", "ui/utils", "ui/shapes", "components/label", "components/container", "components/label-i", "components/checkbox" ], function(core, notes, __f_sortableheader, dashboardCommon, jq, cmn, uiUtils, shapes, __c_label, __c_container, __c_label_i, __c_checkbox) {
    return new class {
        constructor() {
            this.dfe = __c_container("rbody", {
                get: $$ => $$('.rows'),
                atr: function($$){
                	let params = this.params($$);
                	return {
	                    filter: params.rowFilter,
	                    skip: params.skipColumns,
	                    class: 'dashboard-table ' + params.tableClass,
	                    order: dashboardCommon.makeSortFunction($$)
	                }
                }
            }, [ __c_label("h.quoteid", {
                class: "header",
                get: $$ => 'QuoteId'
            }), __c_label("h.accountName", {
                class: "header",
                get: () => 'Account Name'
            }), __c_label("h.companyCode", {
                class: "header",
                get: () => 'Program'
            }), __f_sortableheader("h.producerCode", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Producer Code', '.producerCode')
            }), __f_sortableheader("h.effectiveDate", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Effective Date', '.effectiveDate')
            }), __f_sortableheader("h.writtenPremium", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Written Premium', '.writtenPremium')
            }), __f_sortableheader("h.govClass", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'GOV CC', '.govClass')
            }), __f_sortableheader("h.grade", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Grade', '.grade')
            }), __f_sortableheader("h.newRenewal", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Type', '.newRenewal')
            }), __c_label("h.notes", {
                class: "header",
                get: $$ => 'Notes'
            }), __f_sortableheader("h.userId", {
                class: "header",
            	atr: $$ => dashboardCommon.sortHeaderAtr($$, 'Assn. UW', '.userId')
            }), __c_label("h.reassign", {
                class: "header",
                get: $$ => 'Re-Assign'
            }), __c_label_i("quoteid", {
                get: $$ => `<a style="color: #59afe1" href="/DelegateWorkflow.do?workflowName=ShowWorkersCompApplication&quoteId=${$$('.quoteid')}">${$$('.quoteid')}</a>`,
                atr: () => ({
                    html: true
                })
            }), __c_label_i("accountName", {
                get: $$ => $$('.accountName')
            }), __c_label_i("companyCode", {
                get: $$ => $$('.companyCode')
            }), __c_label_i("producerCode", {
                get: $$ => $$('.producerCode')
            }), __c_label_i("effectiveDate", {
                get: function($$) {
                    let v = $$('.effectiveDate');
                    if (typeof v == 'string') return v.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');
                }
            }), __c_label_i("writtenPremium", {
                get: function($$) {
                    let v = $$('.writtenPremium');
                    if (typeof v == 'string') return v.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
                }
            }), __c_label_i("govClass", {
                get: $$ => $$('.govClass')
            }), __c_label_i("grade", {
                get: $$ => $$('.grade')
            }), __c_label_i("newRenewal", {
                get: $$ => $$('.newRenewal')
            }), __c_label_i("notes", {
                get: $$ => shapes.svgShape($$, 'svg-icon-file-text'),
                atr: $$ => ({
                    style: `opacity: ${this.firstUserNote($$) ? 1 : .3}`,
                    events: {
                        click: () => this.showNotes($$)
                    }
                })
            }), __c_label_i("userId", {
            	get: $$ => $$('.userId')
            }), __c_checkbox("reassign", {
            	get: $$ => $$('.reassign'),
            	set: ($$, value) => $$.set('.reassign', value)
            }) ])
        }
        firstUserNote(row) {
            let user = row.get('currentUser');
            return row.get('.note').filter(n => n.get('.user') == user && n.get('.subject') != 0).pop();
        }
        showNotes($$) {
            let qid = $$('.quoteid'), map = this.noteRt, rt = map.get(qid);
            if (!rt) {
                map.set(qid, rt = core.startRuntime({
                    params: {
                        parentControl: $$.control
                    },
                    form: notes.form,
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
                jq(rt.rootUI[0]).dialog('moveToTop');
            }
        }
        setupPopup() {
            let self = this;
            jq(document).on('mousemove', function(e) {
                let c = jq('.dashboard-quotes-popup'), p = c.parent()[0], t = e.target, control = t._dfe_;
                p && p != t && (!jq.contains(p, t) || e.target.tagName != 'LABEL') && c.remove();
                if (control && c.parent().length == 0) {
                    let $$ = control.model, text = '', fld = control.field.data.name;
                    if (fld == 'producerCode') text = $$('.producerName');
                    if (fld == 'govClass') text = $$('.govCCDescription');
                    if (fld == 'notes') ($$ = self.firstUserNote($$)) && (text = $$.get('.subject'));
                    text && jq('<label>').appendTo(jq('<div>').appendTo(jq(t)).attr({
                        class: 'dashboard-quotes-popup'
                    })).text(text);
                }
            });
        }
        setup() {
            this.noteRt = new Map();
            this.setupPopup();
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
    		`, this.name);
        } 
    }();
});