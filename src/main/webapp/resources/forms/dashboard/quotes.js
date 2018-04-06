defineForm("dashboard/quotes", [ "require", "dfe-core", "forms/dashboard/notes", "forms/dashboard/sortableheader", "forms/dashboard/common", "ui/jquery-ui", "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "components/html", "components/label", "components/div", "components/c-editbox", "components/c-dropdown", "components/editbox", "components/button", "components/container", "components/label-i" ], function(require, core, notes, __f_sortableheader, dashboardCommon, jq, cmn, uiUtils, shapes, fields, __c_html, __c_label, __c_div, __c_c_editbox, __c_c_dropdown, __c_editbox, __c_button, __c_container, __c_label_i) {
    return new class {
        constructor() {
            this.dfe = __c_container("root", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    style: 'width: 100%'
                })
            }, [ __c_container("filtr", {
                get: $$ => $$('filterCollapsed') == 'Y' ? [] : $$('criteria'),
                atr: () => ({
                    class: 'dashboard-filtr'
                })
            }, [ __c_div("field-2", {
                class: "header",
                get: $$ => [ $$ ],
                pos: [ {
                    w: "4"
                } ]
            }, [ __c_html("field-49", {
                get: $$ => shapes.cssShape($$, $$('filterCollapsed') == 'Y' ? 'css-button-plus' : 'css-button-minus'),
                atr: $$ => ({
                    events: {
                        click: () => $$.set('filterCollapsed', $$('filterCollapsed') == 'Y' ? 'N' : 'Y')
                    }
                }),
                pos: [ {
                    colstyle: "display: inline-block; float: left; padding: 1px; background: white; border-radius: 3px;"
                } ]
            }), __c_label("field-48", {
                get: () => 'Report Filter',
                pos: [ {
                    colstyle: "display: inline-block; padding: 0px 100px"
                } ]
            }) ]), __c_c_editbox("field-4", {
                set: function($$, value) {
                    $$.set('.effFrom', value);
                    let to = cmn.ARFtoDate($$('.effTo')), fr = cmn.ARFtoDate(value);
                    fr instanceof Date && to instanceof Date && (fr > to || to - fr.setDate(fr.getDate() + 90) > 0) && $$.set('.effTo', cmn.yyyymmdd(fr));
                },
                atr: () => fields.date('.effFrom', {
                    text: 'Effective Date Range:',
                    vstrategy: 'notified',
                    eclass: 'wrong-date',
                    type: 'datepicker'
                })
            }), __c_c_editbox("field-6", {
                set: function($$, value) {
                    $$.set('.effTo', value);
                    let fr = cmn.ARFtoDate($$('.effFrom')), to = cmn.ARFtoDate(value);
                    fr instanceof Date && to instanceof Date && (to < fr || to.setDate(to.getDate() - 90) - fr > 0) && $$.set('.effFrom', cmn.yyyymmdd(to));
                },
                atr: () => fields.date('.effTo', {
                    text: 'to:',
                    vstrategy: 'notified',
                    eclass: 'wrong-date',
                    type: 'datepicker'
                })
            }), __c_c_dropdown("field-8", {
                get: function($$) {
                    var uniq = new Set();
                    $$('quotes.rows.companyCode').forEach(c => uniq.add(c));
                    return {
                        value: $$('.companyCode'),
                        items: [ {
                            value: '',
                            description: 'All'
                        } ].concat(Array.from(uniq).sort())
                    };
                },
                set: ($$, value) => $$.set('.companyCode', value),
                atr: () => ({
                    text: 'Carrier:'
                }),
                pos: [ {
                    n: "Y"
                }, {
                    w: "3"
                } ]
            }), __c_c_dropdown("field-10", {
                get: $$ => ({
                    value: $$('.newRenewal'),
                    items: [ {
                        value: '',
                        description: 'All'
                    }, 'New', 'Renewal' ]
                }),
                set: ($$, value) => $$.set('.newRenewal', value),
                atr: $$ => ({
                    text: 'New/Renewal:'
                }),
                pos: [ {
                    n: "Y"
                }, {
                    w: "3"
                } ]
            }), __c_c_dropdown("field-12", {
                get: $$ => ({
                    value: $$('.optional'),
                    items: [ {
                        value: '',
                        description: 'None'
                    }, {
                        value: '.accountName',
                        description: 'Account Name'
                    }, {
                        value: '.quoteid',
                        description: 'Application #'
                    }, {
                        value: '.FEIN',
                        description: 'FEIN #'
                    }, {
                        value: '.policyNumber',
                        description: 'Policy #'
                    }, {
                        value: '.producerCode',
                        description: 'Producer Code'
                    } ]
                }),
                set: ($$, value) => {
                    $$.set({
                        optional: value,
                        optionalValue: ''
                    });
                },
                atr: $$ => ({
                    text: 'Optional Filter:'
                }),
                pos: [ {
                    n: "Y"
                }, {
                    w: "2"
                } ]
            }), __c_editbox("field-19", {
                atr: $$ => fields.simple('.optionalValue', [], {
                    pattern: this.optPattern($$('optional')),
                    disabled: $$('.optional') == 0
                })
            }), __c_button("field-3", {
                get: $$ => 'Expand/Collapse All',
                set: $$ => $$.set('quotes.expanded', $$('quotes.expanded').filter(v => v == 'Y') == 0 ? 'Y' : 'N'),
                pos: [ {
                    n: "Y"
                } ]
            }), __c_button("field-1", {
                get: $$ => 'Reset',
                set: $$ => jq.get('/AJAXServlet.srv?method=DashboardScriptHelper&action=getcriteria&default=true', r => $$.reflect(JSON.parse(r.result).criteria[0])),
                atr: $$ => ({
                    style: 'color: #000'
                }),
                pos: [ {
                    s: "padding-bottom: 20px;"
                } ]
            }) ]), __c_div("report", {
                get: function($$) {
                    let effFrom = $$('criteria.effFrom'), effTo = $$('criteria.effTo');
                    cmn.ARFtoDate(effFrom) instanceof Date && cmn.ARFtoDate(effTo) instanceof Date && this.loadDateRange($$.unbound, effFrom, effTo);
                    return [ $$ ];
                },
                atr: () => ({
                    style: 'margin-top: 2px; position: relative'
                }),
                pos: [ {
                    n: "Y",
                    w: "2"
                } ]
            }, [ __c_html("loading", {
                get: $$ => shapes.cssShape($$, 'css-loading-anim-circle'),
                atr: $$ => ({
                    class: 'loading-overlay',
                    style: `display: ${$$('loading') == 0 ? 'none' : ''}`
                })
            }), __c_container("filtered", {
                get: $$ => $$('quotes'),
                atr: () => ({
                    class: 'dashboard-filtr',
                    filter: res => res.get('.rows').filter(row => this.shouldShow(row)).length > 0,
                    order: (res1, res2) => Number(res1.get('.order')) - Number(res2.get('.order'))
                })
            }, [ __c_html("field-18", {
                get: $$ => shapes.cssShape($$, $$('.expanded') == 'Y' ? 'css-button-minus' : 'css-button-plus'),
                atr: $$ => ({
                    style: 'width: 12px; height: 12px; margin: 3px',
                    events: {
                        click: () => $$.set('.expanded', $$('.expanded') == 'Y' ? 'N' : 'Y')
                    }
                })
            }), __c_label("field-14", {
                get: $$ => $$('.status') + ' (' + $$('.rows').filter(row => this.shouldShow(row)).length + ')',
                atr: $$ => ({
                    style: 'white-space: nowrap'
                }),
                pos: [ {
                    s: "padding-top: 3px;"
                } ]
            }), __c_label("field-15", {
                class: "header",
                get: $$ => 'Status',
                pos: [ {
                    w: "2"
                } ]
            }), __c_label("field-16", {
                class: "header",
                get: $$ => 'Details'
            }), __c_container("rwrap", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    style: 'border-collapse: collapse; width:100%;',
                    skip: $$('.expanded') == 'Y' ? 'field-21' : 'rbody'
                }),
                pos: [ {
                    s: "justify-content: center; display: flex;"
                } ]
            }, [ __c_label("field-21", {
                get: $$ => '...',
                atr: $$ => ({
                    style: 'display:block; text-align: center;'
                })
            }), __c_container("rbody", {
                get: $$ => $$('.rows'),
                atr: $$ => ({
                    filter: row => this.shouldShow(row),
                    class: 'dashboard-rbody-tbl',
                    order: dashboardCommon.makeSortFunction($$)
                })
            }, [ __c_label("h.quoteid", {
                class: "header",
                get: $$ => 'QuoteId'
            }), __c_label("h.accountName", {
                class: "header",
                get: () => 'Account Name',
                atr: () => ({
                    style: 'width: 300px; display: block; margin-top: 2px'
                })
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
            }), __c_label("field-50", {
                class: "header",
                get: $$ => 'Notes'
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
            }) ]) ]) ]) ]) ]);
        }
        loadDateRange(px, effFrom, effTo) {
            let f = this, url = `/AJAXServlet.srv?method=DashboardScriptHelper&action=geninfo&lob=WORK&eff=${effFrom}&effTo=${effTo}&idKey=${++f.idKey}`, toLoad = [], curRep = px('quotes'), matched = new Set();
            px.set('loading', 1);
            jq.get(url, function(data) {
                if (!data.idKey || +data.idKey > +f.lastProcessedKey) {
                    px.set('loading');
                    f.lastProcessedKey = +data.idKey;
                    if (data && data.status == 'success') {
                        data.result.forEach(res => {
                            res.rows.forEach(r => matched.add(r.quoteid));
                            let idx = px('quotes.status').indexOf(res.status);
                            if (idx != -1) {
                                let curRez = curRep[idx];
                                res.rows.forEach(r => curRez.get('.rows.quoteid').indexOf(r.quoteid) == -1 && toLoad.splice(-1, 0, curRez.append('.rows', r)[0]));
                            } else {
                                res = cmn.extend({
                                    sortOrder: '.effectiveDate.writtenPremium.govClass.newRenewal',
                                    sortInverse: '.writtenPremium'
                                }, res);
                                toLoad = toLoad.concat(px.append('quotes', res)[0].get('.rows'));
                            }
                        });
                        px('quotes.rows').forEach(r => matched.has(r.get('.quoteid')) || r.detach());
                        for (let i = 0, j = toLoad.length, chunk = 20; i < j; i += chunk) {
                            let sub = toLoad.slice(i, i + chunk), qs = sub.map(row => 'quoteId=' + row.get('.quoteid')).join('&');
                            jq.get(`/AJAXServlet.srv?method=DashboardScriptHelper&action=details&${qs}`, data => {
                                sub.forEach(r => {
                                    let det = data.result[r.get('.quoteid')];
                                    if (det) for (let k in det) r.set('.' + k, det[k]);
                                    r.set('.ready', 'Y');
                                });
                            });
                            jq.get(`/AJAXServlet.srv?method=DashboardScriptHelper&action=notes&${qs}`, data => {
                                sub.forEach(r => {
                                    let det = data.result[r.get('.quoteid')];
                                    det && det.forEach(note => r.append('.note', note));
                                });
                            });
                        }
                    } else curRep.forEach(r => r.detach());
                }
            });
        }
        showPopup(ui, text) {
            text && jq('<label>').appendTo(jq('<div>').appendTo(jq(ui)).attr({
                class: 'dashboard-quotes-popup'
            })).text(text);
        }
        optPattern(opt) {
            return opt == '.quoteid' || opt == '.FEIN' ? '\\d{1,9}' : opt == '.producerCode' ? '\\d{1,6}' : '.{1,50}';
        }
        shouldShow($$) {
            let cc = $$.get('criteria.companyCode'), newRenewal = $$.get('criteria.newRenewal'), v = $$.get('criteria.optionalValue').toString().toUpperCase().replace(/[^\w]/g, ''), f = $$.get('criteria.optional');
            if (f != 0 && v != 0 && (f == '.accountName' ? [ f, '.DBA' ] : [ f ]).filter(f => $$.get(f).toString().toUpperCase().replace(/[^\w]/g, '').indexOf(v) != -1).length == 0) return false;
            return (cc == 0 || $$.get('.companyCode') == cc) && (newRenewal == 0 || $$.get('.newRenewal') == newRenewal);
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
        onstart($$) {
            let tsUpdate = () => $$.get('quotes.rows.note').forEach(n => n.get('.isnew') != 0 && n.set('.datetime', notes.form.now()));
            setTimeout(() => {
                tsUpdate(), setInterval(tsUpdate, 6e4);
            }, (61 - new Date().getSeconds()) * 1e3);
            $$.get('qs-crit') == 0 && $$.set('qs-crit', 'submissionId');
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
            this.setupPopup();
            this.noteRt = new Map();
            this.idKey = this.lastProcessedKey = 0;
            this.style(this.name, [ 'quoteid', 'accountName', 'companyCode', 'producerCode', 'effectiveDate', 'writtenPremium', 'govClass', 'grade', 'newRenewal', 'notes' ]);
        }
        style(name, columns) {
            uiUtils.setDfeCustomStyle(`
        	    .dashboard-filtr th, .dashboard-rbody-tbl th {
    		        background-color: #97a47a;
    		        border-right: solid 2px white;
    		        white-space: nowrap;
    		    }

    		    .dashboard-filtr th label, .dashboard-filtr th input[type="button"] {
    		        color: white;
    		        padding-left: 1px;
    		        padding-right: 1px;
    		        outline: none;
    		    }

    		    .dashboard-filtr, .dashboard-rbody-tbl {
    		        border-collapse: collapse;
    		    }
    		    
    		    .wrong-date {
    		        background: antiquewhite;
    		    }

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
    		    				
				.dashboard-rbody-tbl td {
				    font-size: 12px;
				}
				
				.dashboard-rbody-tbl th {
                    padding: 2px 15px 2px 15px;
                }
                
                .dashboard-rbody-tbl th > div {
                    display: flex;
                }
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('quoteid') + 1}) {
            		text-align: center;
				}
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('accountName') + 1}) {
				    min-width: 300px;
				    width: 300px;
				}
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('companyCode') + 1}) {
				    text-align: center;
				}
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('producerCode') + 1}) {
            		text-align: center;
            		position: relative;
            		overflow: visible;
				}
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('effectiveDate') + 1}) {
            		text-align: center;
				}
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('writtenPremium') + 1}) {
            		text-align: right;
            		position: relative;
				}
				
                .dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('writtenPremium') + 1})::before {
                    content: '$';
                    position: absolute;
                    font: 400 12px Arial;
                    left: 15px;
                }				
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('govClass') + 1}) {
            		text-align: center;
				}

				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('govClass') + 1}) > .dashboard-quotes-popup > label {
            		left: -110px;
				}
								
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('grade') + 1}) {
            		text-align: center;
				}
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('newRenewal') + 1}) {
            		padding-left: 5px
				}	
					
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('notes') + 1}) {
            		text-align: center;
            		cursor: pointer;
				}
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('notes') + 1}) > svg {
            		width: 16px;
            		height: 16px;
				}
				
				.dashboard-rbody-tbl td:nth-child(10n+${columns.indexOf('notes') + 1}) > .dashboard-quotes-popup > label {
            		left: -120px;
				}
				`, name);
        }
    }();
});