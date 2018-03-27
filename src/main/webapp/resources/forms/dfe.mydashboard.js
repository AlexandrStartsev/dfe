defineForm("dfe.mydashboard", [ "require", "dfe-core", "forms/dfe.notes", "ui/jquery-ui", "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "components/container", "components/div", "components/c-editbox", "components/c-dropdown", "components/editbox", "components/form", "components/button", "components/html", "components/label", "components/editbox-$" ], function(require, core, notesForm, jq, cmn, uiUtils, shapes, fields, __c_container, __c_div, __c_c_editbox, __c_c_dropdown, __c_editbox, __c_form, __c_button, __c_html, __c_label, __c_editbox_$) {
    return new class {
        constructor() {
            this.dfe = [ {
                name: "root",
                component: __c_container,
                get: $$ => [ $$ ],
                atr: () => ({
                    style: 'background-color: white; width: 900px'
                })
            }, {
                name: "filtr",
                component: __c_container,
                parent: "root",
                get: $$ => $$('filterCollapsed') == 'Y' ? [] : [ $$ ]
            }, {
                name: "field-2",
                component: __c_div,
                parent: "filtr",
                class: "header",
                get: $$ => [ $$ ],
                pos: [ {
                    w: "4"
                } ]
            }, {
                name: "field-4",
                component: __c_c_editbox,
                parent: "filtr",
                set: function($$, value) {
                    $$.set('effFrom', value);
                    let to = cmn.ARFtoDate($$('effTo')), fr = cmn.ARFtoDate(value);
                    fr.setDate(fr.getDate() + 90);
                    to - fr > 0 && $$.set('effTo', cmn.yyyymmdd(fr));
                },
                atr: () => fields.date('Effective Date Range:', 'effFrom', {
                    vstrategy: 'notified',
                    trigger: 'change',
                    eclass: 'wrong-date',
                    type: 'datepicker'
                })
            }, {
                name: "field-6",
                component: __c_c_editbox,
                parent: "filtr",
                set: function($$, value) {
                    $$.set('effTo', value);
                    let fr = cmn.ARFtoDate($$('effFrom')), to = cmn.ARFtoDate(value);
                    to.setDate(to.getDate() - 90);
                    to - fr > 0 && $$.set('effFrom', cmn.yyyymmdd(to));
                },
                atr: () => fields.date('to:', 'effTo', {
                    vstrategy: 'notified',
                    trigger: 'change',
                    eclass: 'wrong-date',
                    type: 'datepicker'
                })
            }, {
                name: "field-8",
                component: __c_c_dropdown,
                parent: "filtr",
                get: function($$) {
                    var uniq = new Set();
                    $$('result.rows.companyCode').forEach(c => uniq.add(c));
                    return {
                        value: $$('companyCode'),
                        items: [ {
                            value: '',
                            description: 'All'
                        } ].concat(Array.from(uniq).sort())
                    };
                },
                set: ($$, value) => $$.set('companyCode', value),
                atr: () => ({
                    text: 'Carrier:'
                }),
                pos: [ {
                    n: "Y"
                }, {
                    w: "3"
                } ]
            }, {
                name: "field-10",
                component: __c_c_dropdown,
                parent: "filtr",
                get: $$ => ({
                    value: $$('newRenewal'),
                    items: [ {
                        value: '',
                        description: 'All'
                    }, 'New', 'Renewal' ]
                }),
                set: ($$, value) => $$.set('newRenewal', value),
                atr: $$ => ({
                    text: 'New/Renewal:'
                }),
                pos: [ {
                    n: "Y"
                }, {
                    w: "3"
                } ]
            }, {
                name: "field-12",
                component: __c_c_dropdown,
                parent: "filtr",
                get: $$ => ({
                    value: $$('optional'),
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
                    n: "Y",
                    s: "padding-bottom: 20px;"
                }, {
                    w: "2"
                } ]
            }, {
                name: "field-19",
                component: __c_editbox,
                parent: "filtr",
                get: $$ => $$('optionalValue'),
                set: ($$, value) => $$.set('optionalValue', value),
                atr: $$ => ({
                    pattern: this.optPattern($$('optional')),
                    disabled: $$('optional') == 0
                })
            }, {
                name: "qs",
                component: __c_form,
                parent: "root",
                get: $$ => [ $$ ],
                atr: $$ => ({
                    action: '/tools/work/QuoteSearch.do',
                    method: 'post'
                }),
                pos: [ {
                    s: "float: right"
                } ]
            }, {
                name: "qs-crit",
                component: __c_c_dropdown,
                parent: "qs",
                get: $$ => ({
                    value: $$('qs-crit'),
                    items: [ {
                        value: 'submissionId',
                        description: 'Application #'
                    }, {
                        value: 'feinNumber',
                        description: 'FEIN #'
                    }, {
                        value: 'policyNumber',
                        description: 'Policy #'
                    } ]
                }),
                set: ($$, value) => $$.set('qs-crit', value),
                atr: $$ => ({
                    text: 'Quick Search:',
                    cstyle: 'font-weight: bold;'
                }),
                pos: [ {
                    colstyle: "display: inline; padding: 2px 2px"
                }, {
                    colstyle: "display: inline"
                } ]
            }, {
                name: "qs-value",
                component: __c_editbox,
                parent: "qs",
                get: $$ => $$('qs-' + $$('qs-crit')),
                set: ($$, value) => $$.set('qs-' + $$('qs-crit'), value),
                atr: $$ => ({
                    pattern: $$('qs-crit') == 'policyNumber' ? '.{1,32}' : '\\d{1,12}',
                    name: 'com.arrow.tools.reports.app.commercial.workerscomp.SubmittedApplicationsReport.' + $$('qs-crit')
                }),
                pos: [ {
                    colstyle: "display: inline; padding: 2px 2px"
                } ]
            }, {
                name: "qs-submit",
                component: __c_button,
                parent: "qs",
                get: $$ => 'Search',
                atr: $$ => ({
                    type: 'submit',
                    style: 'padding: 0px 5px'
                }),
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }, {
                name: "report",
                component: __c_div,
                parent: "root",
                get: function($$) {
                    let effFrom = $$('effFrom'), effTo = $$('effTo');
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
            }, {
                name: "loading",
                component: __c_html,
                parent: "report",
                get: $$ => shapes.cssShape($$, 'css-loading-anim-circle'),
                atr: $$ => ({
                    style: `display: ${$$('loading') == 0 ? 'none' : ''}; align-content: center; justify-content: center; position: absolute; width: 100%; height: 100%; min-height: 200px; min-width: 200px; background: lightgray; opacity: 0.3`
                })
            }, {
                name: "filtered",
                component: __c_container,
                parent: "report",
                get: $$ => $$('result'),
                atr: () => ({
                    filter: res => res.get('.rows').filter(row => this.shouldShow(row)).length > 0,
                    order: (res1, res2) => Number(res1.get('.order')) - Number(res2.get('.order'))
                })
            }, {
                name: "field-18",
                component: __c_html,
                parent: "filtered",
                get: $$ => shapes.cssShape($$, $$('.expanded') == 'Y' ? 'css-button-minus' : 'css-button-plus'),
                atr: $$ => ({
                    style: 'width: 12px; height: 12px; margin: 3px',
                    events: {
                        click: () => $$.set('.expanded', $$('.expanded') == 'Y' ? 'N' : 'Y')
                    }
                })
            }, {
                name: "field-14",
                component: __c_label,
                parent: "filtered",
                get: $$ => $$('.status') + ' (' + $$('.rows').filter(row => this.shouldShow(row)).length + ')',
                atr: $$ => ({
                    style: 'white-space: nowrap'
                }),
                pos: [ {
                    s: "padding-top: 3px;"
                } ]
            }, {
                name: "field-15",
                component: __c_label,
                parent: "filtered",
                class: "header",
                get: $$ => 'Status',
                pos: [ {
                    w: "2"
                } ]
            }, {
                name: "field-16",
                component: __c_label,
                parent: "filtered",
                class: "header",
                get: $$ => 'Details'
            }, {
                name: "rwrap",
                component: __c_container,
                parent: "filtered",
                get: $$ => [ $$ ],
                atr: $$ => ({
                    style: 'width:100%',
                    skip: $$('.expanded') == 'Y' ? 'field-21' : 'rbody'
                }),
                pos: [ {
                    s: "justify-content: center; display: flex;"
                } ]
            }, {
                name: "field-21",
                component: __c_label,
                parent: "rwrap",
                get: $$ => '...',
                atr: $$ => ({
                    style: 'display:block; text-align: center;'
                })
            }, {
                name: "rbody",
                component: __c_container,
                parent: "rwrap",
                get: $$ => $$('.rows'),
                atr: $$ => ({
                    filter: row => this.shouldShow(row),
                    order: (row1, row2) => {
                        let si = row1.get('..sortInverse').toString().split('.'), so = row1.get('..sortOrder').split('.');
                        for (let i = 1; i < so.length; i++) {
                            let l = row1.get('.' + so[i]).toString(), r = row2.get('.' + so[i]).toString();
                            let j = so[i] == 'writtenPremium' ? +l - +r : l.localeCompare(r);
                            if (j != 0) return -j * si.indexOf(so[i]);
                        }
                        return 0;
                    }
                })
            }, {
                name: "field-24",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: $$ => 'QuoteId',
                pos: [ {
                    s: "padding: 2px 15px"
                } ]
            }, {
                name: "field-23",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: () => 'Account Name',
                atr: () => ({
                    style: 'width: 300px; display: block; margin-top: 2px'
                })
            }, {
                name: "field-25",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: () => 'Program',
                pos: [ {
                    s: "padding: 2px 15px;"
                } ]
            }, {
                name: "field-26",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: $$ => 'Producer Code',
                pos: [ {
                    s: "padding-left: 15px; border:0px"
                } ]
            }, {
                name: "field-26a",
                component: __c_html,
                parent: "rbody",
                class: "header",
                atr: $$ => this.sortArrow($$, '.producerCode')
            }, {
                name: "field-27",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: $$ => 'Effective Date',
                pos: [ {
                    s: "padding-left: 15px; border:0px"
                } ]
            }, {
                name: "field-36",
                component: __c_html,
                parent: "rbody",
                class: "header",
                atr: $$ => this.sortArrow($$, '.effectiveDate')
            }, {
                name: "field-28",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: $$ => 'Written Premium',
                pos: [ {
                    s: "padding-left: 15px; border:0px"
                } ]
            }, {
                name: "field-37",
                component: __c_html,
                parent: "rbody",
                class: "header",
                atr: $$ => this.sortArrow($$, '.writtenPremium')
            }, {
                name: "field-38",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: () => 'GOV CC',
                pos: [ {
                    s: "padding-left: 15px; border:0px"
                } ]
            }, {
                name: "field-39",
                component: __c_html,
                parent: "rbody",
                class: "header",
                atr: $$ => this.sortArrow($$, '.govClass')
            }, {
                name: "field-40",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: () => 'Grade',
                pos: [ {
                    s: "padding-left: 15px; border:0px"
                } ]
            }, {
                name: "field-40a",
                component: __c_html,
                parent: "rbody",
                class: "header",
                atr: $$ => this.sortArrow($$, '.grade')
            }, {
                name: "field-41",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: () => 'Type',
                pos: [ {
                    s: "padding-left: 15px; border:0px"
                } ]
            }, {
                name: "field-42",
                component: __c_html,
                parent: "rbody",
                class: "header",
                atr: $$ => this.sortArrow($$, '.newRenewal')
            }, {
                name: "field-50",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: $$ => 'Notes',
                pos: [ {
                    s: "padding: 2px 15px"
                } ]
            }, {
                name: "field-29",
                component: __c_label,
                parent: "rbody",
                get: $$ => `<a style="color: #59afe1" href="/DelegateWorkflow.do?workflowName=ShowWorkersCompApplication&quoteId=${$$('.quoteid')}">${$$('.quoteid')}</a>`,
                atr: () => ({
                    class: 'label-centered',
                    html: true
                })
            }, {
                name: "field-30",
                component: __c_label,
                parent: "rbody",
                get: $$ => $$('.accountName'),
                pos: [ {
                    s: "min-width: 300px; width: 300px"
                } ]
            }, {
                name: "field-31",
                component: __c_label,
                parent: "rbody",
                get: $$ => $$('.companyCode'),
                atr: () => ({
                    class: 'label-centered'
                })
            }, {
                name: "field-46",
                component: __c_div,
                parent: "rbody",
                get: $$ => [ $$ ],
                atr: () => ({
                    class: 'hoverable'
                }),
                pos: [ {
                    w: "2"
                } ]
            }, {
                name: "field-32",
                component: __c_label,
                parent: "field-46",
                get: $$ => $$('.producerCode'),
                atr: () => ({
                    class: 'label-centered'
                })
            }, {
                name: "field-47",
                component: __c_label,
                parent: "field-46",
                get: $$ => $$('.producerName'),
                atr: $$ => ({
                    class: 'display-on-hover'
                }),
                pos: [ {
                    colstyle: "position: absolute"
                } ]
            }, {
                name: "field-33",
                component: __c_editbox,
                parent: "rbody",
                get: $$ => $$('.effectiveDate'),
                atr: () => ({
                    formatting: 'MM/DD/YYYY',
                    transform: '67890134',
                    readonly: 1,
                    style: 'border: none;',
                    class: 'label-centered'
                }),
                pos: [ {
                    w: "2"
                } ]
            }, {
                name: "field-34",
                component: __c_editbox_$,
                parent: "rbody",
                get: $$ => $$('.writtenPremium'),
                atr: () => ({
                    formatting: '9,999,999,999',
                    readonly: 1,
                    style: 'border: none; width: 100%; text-align: right;'
                }),
                pos: [ {
                    s: ".dollar-prefix",
                    w: "2"
                } ]
            }, {
                name: "field-43",
                component: __c_label,
                parent: "rbody",
                get: $$ => $$('.govClass'),
                atr: () => ({
                    class: 'label-centered'
                }),
                pos: [ {
                    w: "2"
                } ]
            }, {
                name: "field-44",
                component: __c_label,
                parent: "rbody",
                get: $$ => $$('.grade'),
                atr: () => ({
                    style: 'margin-left: 5px'
                }),
                pos: [ {
                    w: "2"
                } ]
            }, {
                name: "field-45",
                component: __c_label,
                parent: "rbody",
                get: $$ => $$('.newRenewal'),
                atr: () => ({
                    style: 'margin-left: 5px'
                }),
                pos: [ {
                    w: "2"
                } ]
            }, {
                name: "field-49",
                component: __c_html,
                parent: "field-2",
                get: $$ => shapes.cssShape($$, $$('filterCollapsed') == 'Y' ? 'css-button-plus' : 'css-button-minus'),
                atr: $$ => ({
                    events: {
                        click: () => $$.set('filterCollapsed', $$('filterCollapsed') == 'Y' ? 'N' : 'Y')
                    }
                }),
                pos: [ {
                    colstyle: "display: inline-block; float: left; padding: 1px; background: white; border-radius: 3px;"
                } ]
            }, {
                name: "field-48",
                component: __c_label,
                parent: "field-2",
                get: () => 'Report Filter',
                pos: [ {
                    colstyle: "display: inline-block; padding: 0px 100px"
                } ]
            }, {
                name: "field-51",
                component: __c_div,
                parent: "rbody",
                atr: function($$) {
                    let n = this.firstUserNote($$);
                    return {
                        class: 'note-icon hoverable',
                        style: `opacity: ${n.length ? 1 : .3}; display: inline-block; cursor: pointer; width: 16px; height: 16px;`,
                        get: () => n,
                        events: {
                            click: () => this.showNotes($$)
                        }
                    };
                },
                pos: [ {
                    s: ".label-centered"
                } ]
            }, {
                name: "field-52a",
                component: __c_html,
                parent: "field-51",
                class: 'header',
                get: $$ => shapes.svgShape($$, 'svg-icon-file-text'),
                atr: $$ => ({
                    style: 'width: 16px; height: 16px',
                    nowrap: 1
                })
            }, {
                name: "field-52",
                component: __c_label,
                parent: "field-51",
                get: $$ => $$('.subject'),
                atr: $$ => ({
                    class: 'display-on-hover'
                }),
                pos: [ {
                    colstyle: "position: absolute; width:  0px;"
                } ]
            }, {
                name: "field-53",
                component: __c_editbox,
                parent: "qs",
                get: $$ => 'com.arrow.tools.reports.app.commercial.workerscomp.SubmittedApplicationsReport',
                atr: $$ => ({
                    name: 'com.arrow.reports.reportId'
                }),
                pos: [ {
                    colstyle: "display: none"
                } ]
            }, {
                name: "field-54",
                component: __c_editbox,
                parent: "qs",
                get: $$ => '/tools/commercial/workerscomp/application_search.jsp',
                atr: $$ => ({
                    name: 'com.arrow.reports.referrer'
                }),
                pos: [ {
                    colstyle: "display: none"
                } ]
            } ];
        }
        loadDateRange(px, effFrom, effTo) {
            let f = this, url = `/AJAXServlet.srv?method=DashboardScriptHelper&action=geninfo&lob=WORK&eff=${effFrom}&effTo=${effTo}&idKey=${++f.idKey}`, toLoad = [], curRep = px('result'), matched = new Set();
            px.set('loading', 1);
            jq.get(url, function(data) {
                if (!data.idKey || +data.idKey > +f.lastProcessedKey) {
                    px.set('loading');
                    f.lastProcessedKey = +data.idKey;
                    if (data && data.status == 'success') {
                        data.result.forEach(res => {
                            res.rows.forEach(r => matched.add(r.quoteid));
                            let idx = px('result.status').indexOf(res.status);
                            if (idx != -1) {
                                let curRez = curRep[idx];
                                res.rows.forEach(r => curRez.get('.rows.quoteid').indexOf(r.quoteid) == -1 && toLoad.splice(-1, 0, curRez.append('.rows', r)[0]));
                            } else {
                                res = cmn.extend({
                                    sortOrder: '.effectiveDate.writtenPremium.govClass.newRenewal',
                                    sortInverse: '.writtenPremium'
                                }, res);
                                toLoad = toLoad.concat(px.append('result', res)[0].get('.rows'));
                            }
                        });
                        px('result.rows').forEach(r => matched.has(r.get('.quoteid')) || r.detach());
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
        sortArrow($$, fld) {
            return {
                class: 'header-button',
                nowrap: true,
                get: $$ => shapes.svgShape($$, 'svg-arrow-' + ($$('.sortInverse').indexOf(fld) == -1 ? 'up' : 'down')),
                events: {
                    click: function() {
                        let si = $$.get('.sortInverse'), so = $$.get('.sortOrder');
                        $$.set('.sortInverse', si.indexOf(fld) == -1 ? fld + si : si.replace(fld, ''));
                        $$.set('.sortOrder', fld + so.replace(fld, ''));
                    }
                }
            };
        }
        optPattern(opt) {
            return opt == '.quoteid' || opt == '.FEIN' ? '\\d{1,9}' : opt == '.producerCode' ? '\\d{1,6}' : '.{1,50}';
        }
        shouldShow($$) {
            let cc = $$.get('companyCode'), newRenewal = $$.get('newRenewal'), v = $$.get('optionalValue').toString().toUpperCase().replace(/[^\w]/g, ''), f = $$.get('optional');
            if (f != 0 && v != 0 && (f == '.accountName' ? [ f, '.DBA' ] : [ f ]).filter(f => $$.get(f).toString().toUpperCase().replace(/[^\w]/g, '').indexOf(v) != -1).length == 0) return false;
            return (cc == 0 || $$.get('.companyCode') == cc) && (newRenewal == 0 || $$.get('.newRenewal') == newRenewal);
        }
        firstUserNote(row) {
            let user = row.get('currentUser'), note = row.get('.note').filter(n => n.get('.user') == user && n.get('.subject') != 0).pop();
            return note ? [ note ] : [];
        }
        showNotes($$) {
            let qid = $$('.quoteid'), map = this.noteRt, rt = map.get(qid);
            if (!rt) {
                map.set(qid, rt = core.startRuntime({
                    form: notesForm,
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
                jq(rt.rootUI).dialog('moveToTop');
            }
        }
        onstart($$) {
            let tsUpdate = () => $$.get('result.rows.note').forEach(n => n.get('.isnew') != 0 && n.set('.datetime', notesForm.now()));
            setTimeout(() => {
                tsUpdate(), setInterval(tsUpdate, 6e4);
            }, (61 - new Date().getSeconds()) * 1e3);
            $$.get('qs-crit') == 0 && $$.set('qs-crit', 'submissionId');
            this.noteRt = new Map();
            this.idKey = this.lastProcessedKey = 0;
            uiUtils.setDfeCustomStyle(`
        	    th {
    		        background-color: #97a47a;
    		        border-right: solid 2px white;
    		        white-space: nowrap;
    		    }

    		    th label, th input[type="button"] {
    		        color: white;
    		        padding-left: 1px;
    		        padding-right: 1px;
    		        outline: none;
    		    }

    		    table {
    		        border-collapse: collapse;
    		    }

                .header-button {
                    width:16px;
                    height: 16px;
                    fill: white;
                    display: flex;
                }

                .header-button:active {
                    transform: scale(0.9);
                }
    		    
                .dollar-prefix::before {
                    content: '$';
                    position: absolute;
                    font: 400 13.3333px Arial;
                    padding-left: 15px;
                }

    		    .wrong-date {
    		        background: antiquewhite;
    		    }
    		    
    		    .display-on-hover {
    		        display: none;
    		        position: relative;
				    left: -20px;
				    opacity: 0.9;
				    background: antiquewhite;
				    padding: 5px 10px;
				    border-radius: 7px;
				    box-shadow: 2px 2px lightgrey;
				    z-index: 100;
    		    }
    		    
    		    .hoverable:hover .display-on-hover {
    		        display: block;
    		    }
    		    
    		    .label-centered {
    		        display: block; 
    		        text-align: center; 
    		        width: 100%;
    		    }
    		    
    		    /*.note-icon {width: 16px;height: 16px;background: url('/images/icon-file-text.svg');display: inline-block;}*/
    		    /*.note-icon {font-family: Arial, Tahoma, sans-serif;font-weight: 300;display: inline-block;width: 10px;height: 12px;position: relative;border-radius: 2px;text-align: left;-webkit-font-smoothing: antialiased;background: #f4b400;cursor: pointer;}.note-icon::before {display: block;content: "";position: absolute;top: 0;right: 0;width: 0;height: 0;border-bottom-left-radius: 1px;border-width: 2px;border-style: solid;border-color: #fff #fff rgba(255,255,255,.35) rgba(255,255,255,.35);box-sizing: inherit;}*/
				
            	.note-icon .display-on-hover {
            		left: -220px;
            		top: 3px;
            		width: 200px;
            	}
				
				.ui-widget-header{
				    background: #97a47a;
				    color: #fff;
				}
				
				.ui-dialog .ui-dialog-content{
            		text-align: left; 
            		padding: 4px;
				}`, this.name);
        }
    }();
});