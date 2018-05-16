define([ "dfe-core", "forms/dashboard/statusgrid", "forms/dashboard/notes", "forms/dashboard/common", "ui/jquery-ui", "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "components/html", "components/label", "components/div", "components/labeled-editbox", "components/labeled-dropdown", "components/editbox", "components/button", "components/table", "components/container", "components/span" ], function(Core, StatusGridForm, NotesForm, dashboardCommon, jq, cmn, uiUtils, shapes, fields, Html, Label, Div, LabeledEditbox, LabeledDropdown, Editbox, Button, Table, Container, Span) {
    let Form = Core.Form;
    let detailGridColumns = [ 'quoteid', 'accountName', 'companyCode', 'producerCode', 'effectiveDate', 'writtenPremium', 'govClass', 'grade', 'newRenewal', 'notes' ];
    let detailsGridClass = 'dashboard-rbody-tbl';
    class MyAssignmentForm extends Form {
        constructor(node) {
            super(node);
            let $$ = node.unboundModel;
            let tsUpdate = () => $$.get('my.quotes.rows.note').forEach(n => n.get('.isnew') != 0 && n.set('.datetime', NotesForm.now()));
            setTimeout(() => {
                tsUpdate(), setInterval(tsUpdate, 6e4);
            }, (61 - new Date().getSeconds()) * 1e3);
            $$.get('qs-crit') == 0 && $$.set('qs-crit', 'submissionId');
            this.idKey = this.lastProcessedKey = 0;
        }
        static fields() {
            return Form.field(Table, "root", {
                atr: $$ => ({
                    style: 'width: 100%'
                })
            }, [ Form.field(Table, "filtr", {
                get: $$ => $$.get('filterCollapsed') == 'Y' ? [] : $$.get('criteria'),
                atr: () => ({
                    class: 'dashboard-table'
                })
            }, [ Form.field(Span, "field-2", {
                class: "header",
                atr: () => ({wrap: false}),
                layout: [ {
                    colSpan: "4"
                } ]
            }, [ Form.field(Html, "field-49", {
                get: $$ => shapes.cssShape($$, $$.get('filterCollapsed') == 'Y' ? 'css-button-plus' : 'css-button-minus'),
                atr: $$ => ({
                    events: {
                        onClick: () => $$.set('filterCollapsed', $$.get('filterCollapsed') == 'Y' ? 'N' : 'Y')
                    }
                }),
                layout: [ {
                    style: "display: inline-block; float: left; padding: 1px; background: white; border-radius: 3px;"
                } ]
            }), Form.field(Label, "field-48", {
                get: () => 'Report Filter',
                layout: [ {
                    style: "display: inline-block; padding: 0px 100px"
                } ]
            }) ]), 
            Form.field(LabeledEditbox, "field-4", {
                set: function($$, value) {
                    $$.set('.effFrom', value);
                    let to = cmn.ARFtoDate($$.get('.effTo')), fr = cmn.ARFtoDate(value);
                    fr instanceof Date && to instanceof Date && (fr > to || to - fr.setDate(fr.getDate() + 90) > 0) && $$.set('.effTo', cmn.yyyymmdd(fr));
                },
                atr: () => fields.date('.effFrom', {
                    text: 'Effective Date Range:',
                    vstrategy: 'notified',
                    eclass: 'wrong-date',
                    type: 'datepicker'
                })
            }), Form.field(LabeledEditbox, "field-6", {
                set: function($$, value) {
                    $$.set('.effTo', value);
                    let fr = cmn.ARFtoDate($$.get('.effFrom')), to = cmn.ARFtoDate(value);
                    fr instanceof Date && to instanceof Date && (to < fr || to.setDate(to.getDate() - 90) - fr > 0) && $$.set('.effFrom', cmn.yyyymmdd(to));
                },
                atr: () => fields.date('.effTo', {
                    text: 'to:',
                    vstrategy: 'notified',
                    eclass: 'wrong-date',
                    type: 'datepicker'
                })
            }), Form.field(LabeledDropdown, "field-8", {
                get: function($$) {
                    var uniq = new Set();
                    $$.get('my.quotes.rows.companyCode').forEach(c => uniq.add(c));
                    return {
                        value: $$.get('.companyCode'),
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
                layout: [ {
                    newRow: true
                }, {
                    colSpan: "3"
                } ]
            }), Form.field(LabeledDropdown, "field-10", {
                get: $$ => ({
                    value: $$.get('.newRenewal'),
                    items: [ {
                        value: '',
                        description: 'All'
                    }, 'New', 'Renewal' ]
                }),
                set: ($$, value) => $$.set('.newRenewal', value),
                atr: $$ => ({
                    text: 'New/Renewal:'
                }),
                layout: [ {
                    newRow: true
                }, {
                    colSpan: "3"
                } ]
            }), Form.field(LabeledDropdown, "field-12", {
                get: $$ => ({
                    value: $$.get('.optional'),
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
                layout: [ {
                    newRow: true
                }, {
                    colSpan: "2"
                } ]
            }), Form.field(Editbox, "field-19", {
                atr: $$ => fields.simple('.optionalValue', [], {
                    pattern: MyAssignmentForm.optPattern($$.get('optional')),
                    disabled: $$.get('.optional') == 0
                })
            }), Form.field(Button, "field-3", {
                get: $$ => 'Expand/Collapse All',
                set: $$ => $$.set('my.quotes.expanded', $$.get('my.quotes.expanded').filter(v => v == 'Y') == 0 ? 'Y' : 'N'),
                layout: [ {
                    newRow: true
                } ]
            }), Form.field(Button, "field-1", {
                get: $$ => 'Reset',
                set: $$ => jq.get('/AJAXServlet.srv?method=DashboardScriptHelper&action=getcriteria&default=true', r => $$.reflect(JSON.parse(r.result).criteria[0])),
                atr: $$ => ({
                    style: 'color: #000'
                }),
                layout: [ {
                    style: "padding-bottom: 20px;"
                } ]
            }) ]), Form.field(Div, "myassignment", {
                get: $$ => $$.defaultSubset('my'),
                atr: () => ({
                    style: 'width: 100%; position: relative;'
                }),
                layout: [ {
                    newRow: true,
                    colSpan: "2"
                } ]
            }, [ Form.field(Div, "loader", {
            	get: function($$) {
            		let effFrom = $$.get('criteria.effFrom'), effTo = $$.get('criteria.effTo');
                    cmn.ARFtoDate(effFrom) instanceof Date && cmn.ARFtoDate(effTo) instanceof Date && this.loadDateRange($$.unbound, effFrom, effTo);
                    return [ $$ ];
            	}, 
            	atr: $$ => ({
            		style: 'width: 100%;'
            	})
            }, [ Form.field(Html, "loading", {
                get: $$ => shapes.cssShape($$, 'css-loading-anim-circle'),
                atr: $$ => ({
                    class: 'loading-overlay',
                    style: `display: ${$$.get('.loading') == 0 ? 'none' : ''}`
                })
            }), Form.field(StatusGridForm, "report", {
                config: {
                    rowFilterMaker: $$ => MyAssignmentForm.makeRowFilter($$),
            		skipColumns: colName => detailGridColumns.indexOf(colName.replace(/^.*\./,'')) == -1,
            		tableClass: detailsGridClass
                }
            }) ]) ]) ]);
        }
        loadDateRange(px, effFrom, effTo) {
        	let self = this, defaultSort = { sortOrder: '.effectiveDate.writtenPremium.govClass.newRenewal', sortInverse: '.writtenPremium' };
            let url = `/AJAXServlet.srv?method=DashboardScriptHelper&action=geninfo&lob=WORK&eff=${effFrom}&effTo=${effTo}&idKey=${++self.idKey}`, toLoad = [], curRep = px.get('.quotes'), matched = new Set();
            px.set('.loading', 1);
            jq.get(url, function(data) {
                if (!data.idKey || +data.idKey > +self.lastProcessedKey) {
                    px.set('.loading');
                    self.lastProcessedKey = +data.idKey;
                    if (data && data.status == 'success') {
                        data.result.forEach(res => {
                            res.rows.forEach(r => matched.add(r.quoteid));
                            let idx = px.get('.quotes.status').indexOf(res.status);
                            if (idx != -1) {
                                let curRez = curRep[idx];
                                res.rows.forEach(r => curRez.get('.rows.quoteid').indexOf(r.quoteid) == -1 && toLoad.splice(-1, 0, curRez.append('.rows', r)[0]));
                            } else {
                                toLoad = toLoad.concat(px.append('.quotes', cmn.extend(defaultSort, res))[0].get('.rows'));
                            }
                        });
                        px.get('.quotes.rows').forEach(r => matched.has(r.get('.quoteid')) || r.detach());
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
        static optPattern(opt) {
            return opt == '.quoteid' || opt == '.FEIN' ? '\\d{1,9}' : opt == '.producerCode' ? '\\d{1,6}' : '.{1,50}';
        }
        static makeRowFilter($$) {
        	let cc = $$.get('criteria.companyCode').toString(), nr = $$.get('criteria.newRenewal').toString(), v = $$.get('criteria.optionalValue').toString().toUpperCase().replace(/[^\w]/g, ''), f = $$.get('criteria.optional').toString();
        	return (cc + nr + v + f) == 0 ? () => true : $$ => {
        		if (f != 0 && v != 0 && (f == '.accountName' ? [ f, '.DBA' ] : [ f ]).filter(f => $$.get(f).toString().toUpperCase().replace(/[^\w]/g, '').indexOf(v) != -1).length == 0) 
        			return false;
	            return (cc == 0 || $$.get('.companyCode') == cc) && (nr == 0 || $$.get('.newRenewal') == nr);
        	}
        }
    }

    function setupStyle(name, columns, clazz) {
        uiUtils.setDfeCustomStyle(`
            .${clazz}{
                width: 100%
            }

            .${clazz} td {
                font-size: 12px;
            }

            .${clazz} th {
                padding: 2px 15px 2px 15px;
            }

            .${clazz} th > div {
                display: flex;
                justify-content: center;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('quoteid') + 1}) {
                text-align: center;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('accountName') + 1}) {
                min-width: 300px;
                width: 300px;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('companyCode') + 1}) {
                text-align: center;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('producerCode') + 1}) {
                text-align: center;
                position: relative;
                overflow: visible;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('effectiveDate') + 1}) {
                text-align: center;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('writtenPremium') + 1}) {
                text-align: right;
                position: relative;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('writtenPremium') + 1})::before {
                content: '$';
                position: absolute;
                font: 400 12px Arial;
                left: 15px;
            }				

            .${clazz} td:nth-child(10n+${columns.indexOf('govClass') + 1}) {
                text-align: center;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('govClass') + 1}) > .dashboard-quotes-popup > label {
                left: -110px;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('grade') + 1}) {
                text-align: center;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('newRenewal') + 1}) {
                padding-left: 5px
            }	

            .${clazz} td:nth-child(10n+${columns.indexOf('notes') + 1}) {
                text-align: center;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('notes') + 1}) svg {
                width: 16px;
                height: 16px;
                pointer-events: all;
            }

            .${clazz} td:nth-child(10n+${columns.indexOf('notes') + 1}) > .dashboard-quotes-popup > label {
                left: -120px;
            }`, name);     
    }
    
    setupStyle(MyAssignmentForm.name, detailGridColumns, detailsGridClass);
    return MyAssignmentForm;
})