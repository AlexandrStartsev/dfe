defineForm("dfe.mydashboard", [ "require", "jquery", "dfe-common", "components/div", "components/container", "components/label", "components/c-editbox", "components/c-dropdown", "components/editbox", "components/div-button", "components/button", "components/editbox-$" ], function(require, jq, cmn, __c_div, __c_container, __c_label, __c_c_editbox, __c_c_dropdown, __c_editbox, __c_div_button, __c_button, __c_editbox_$) {
    return new class { 
        constructor() {
            this.dfe = [ {
                name: "root",
                component: __c_div,
                get: $$ => [ $$ ],
                atr: () => ({
                    style: 'display: table; background-color: white; width: 900px'
                })
            }, {
                name: "filtr",
                component: __c_container,
                parent: "root",
                get: $$ => [ $$ ]
            }, {
                name: "field-2",
                component: __c_label,
                parent: "filtr",
                class: "header",
                get: $$ => 'Report Filter',
                pos: [ {
                    w: "4"
                } ]
            }, {
                name: "field-4",
                component: __c_c_editbox,
                parent: "filtr",
                get: $$ => $$('effFrom'),
                set: ($$, value) => $$.set('effFrom', value),
                val: $$ => $$.required('.effFrom', 'date'),
                atr: () => ({
                    formatting: 'MM/DD/YYYY',
                    transform: '67890134',
                    style: 'width: 70px',
                    vstrategy: 'notified',
                    eclass: 'wrong-date',
                    text: 'Effective Date Range:'
                })
            }, {
                name: "field-6",
                component: __c_c_editbox,
                parent: "filtr",
                get: $$ => $$('effTo'),
                set: ($$, value) => $$.set('effTo', value),
                val: $$ => $$.required('.effTo', 'date'),
                atr: () => ({
                    formatting: 'MM/DD/YYYY',
                    transform: '67890134',
                    style: 'width: 70px',
                    vstrategy: 'notified',
                    eclass: 'wrong-date',
                    text: 'to:'
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
                    $$.set('optional', value);
                    $$.set('optionalValue', '');
                },
                atr: $$ => ({
                    text: 'Optional Filter:'
                }),
                pos: [ {
                    n: "Y"
                }, {
                    w: "2"
                } ]
            }, {
                name: "field-19",
                component: __c_editbox,
                parent: "filtr",
                get: $$ => $$('optionalValue'),
                set: ($$, value) => $$.set('optionalValue', value)
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
                    style: 'margin-top: 20px'
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
                component: __c_div_button,
                parent: "filtered",
                set: $$ => $$.set('.expanded', $$('.expanded') == 'Y' ? 'N' : 'Y'),
                atr: $$ => ({
                    style: `background: url("/images/base/${$$('.expanded') == 'Y' ? 66 : 65}.png") no-repeat; min-height: auto; width: 12px; height: 12px; margin: 3px`
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
                    s: "padding-top: 4px"
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
                get: $$ => 'Account Name'
            }, {
                name: "field-25",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: $$ => 'Program',
                pos: [ {
                    s: "padding: 2px 15px"
                } ]
            }, {
                name: "field-26",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: $$ => 'Producer Code',
                pos: [ {
                    s: "padding: 2px 15px"
                } ]
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
                component: __c_button,
                parent: "rbody",
                class: "header",
                get: $$ => 'v',
                set: function($$) {
                    this.sortInverse($$, '.effectiveDate');
                },
                atr: $$ => this.getSortButtonAttrs($$, '.effectiveDate')
            }, {
                name: "field-28",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: $$ => 'Written Premium',
                pos: [ {
                    w: "2",
                    s: "padding-left: 15px; border:0px"
                } ]
            }, {
                name: "field-37",
                component: __c_button,
                parent: "rbody",
                class: "header",
                get: $$ => 'v',
                set: function($$) {
                    this.sortInverse($$, '.writtenPremium');
                },
                atr: $$ => this.getSortButtonAttrs($$, '.writtenPremium')
            }, {
                name: "field-29",
                component: __c_label,
                parent: "rbody",
                get: $$ => '<a style="color: #59afe1" href="/DelegateWorkflow.do?workflowName=ShowWorkersCompApplication&quoteId=' + $$('.quoteid') + '">' + $$('.quoteid') + '</a>',
                atr: () => ({
                    class: 'label-centered'
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
                name: "field-32",
                component: __c_label,
                parent: "rbody",
                get: $$ => $$('.producerCode'),
                atr: () => ({
                    class: 'label-centered'
                })
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
                name: "field-35",
                component: __c_label,
                parent: "rbody",
                get: $$ => '$',
                atr: () => ({
                    style: 'position: relative; left: 20px'
                }),
                pos: [ {
                    s: "width: 10px"
                } ]
            }, {
                name: "field-34",
                component: __c_editbox_$,
                parent: "rbody",
                get: $$ => $$('.writtenPremium'),
                atr: () => ({
                    formatting: '9,999,999,999',
                    readonly: 1,
                    style: 'border: none; width: 100%; text-align: right; padding-right: 10px'
                }),
                pos: [ {
                    w: "2"
                } ]
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
                component: __c_button,
                parent: "rbody",
                class: "header",
                get: () => 'v',
                set: ($$, value) => {
                    this.sortInverse($$, '.govClass');
                },
                atr: $$ => this.getSortButtonAttrs($$, '.govClass')
            }, {
                name: "field-40",
                component: __c_label,
                parent: "rbody",
                class: "header",
                get: () => 'Grade',
                pos: [ {
                    s: "padding: 2px 15px"
                } ]
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
                component: __c_button,
                parent: "rbody",
                class: "header",
                get: () => 'v',
                set: ($$, value) => {
                    this.sortInverse($$, '.newRenewal');
                },
                atr: $$ => this.getSortButtonAttrs($$, '.newRenewal')
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
                })
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
            } ];
        }
        loadDateRange(px, effFrom, effTo) {
            let url = '/AJAXServlet.srv?method=DashboardScriptHelper&action=geninfo&lob=WORK&eff=' + effFrom + '&effTo=' + effTo, toLoad = [], curRep = px('result'), matched = new Set();
            jq.get(url, function(data) {
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
                        let sub = toLoad.slice(i, i + chunk), url = '/AJAXServlet.srv?method=DashboardScriptHelper&action=details&' + sub.map(row => 'quoteId=' + row.get('.quoteid')).join('&');
                        jq.get(url, data => {
                            sub.forEach(r => {
                                let det = data.result[r.get('.quoteid')];
                                if (det) for (let k in det) r.set('.' + k, det[k]);
                                r.set('.ready', 'Y');
                            });
                        });
                    }
                } else curRep.forEach(r => r.detach());
            });
        }
        getSortButtonAttrs($$, fld) {
            return {
                class: 'header-button' + ($$('.sortInverse').indexOf(fld) == -1 ? '-flip' : '')
            };
        }
        sortInverse($$, fld) {
            var si = $$.get('.sortInverse'), so = $$.get('.sortOrder');
            $$.set('.sortInverse', si.indexOf(fld) == -1 ? fld + si : si.replace(fld, ''));
            $$.set('.sortOrder', fld + so.replace(fld, ''));
        }
        shouldShow($$) {
            var companyCode = $$.get('companyCode'), newRenewal = $$.get('newRenewal'), optionalValue = $$.get('optionalValue').toString().toUpperCase().replace(/[^\w]/g, ''), optionalField = $$.get('optional');
            if (optionalField != 0 && optionalValue != 0 && $$.get(optionalField).toString().toUpperCase().replace(/[^\w]/g, '').indexOf(optionalValue) == -1) return false;
            return (companyCode == 0 || $$.get('.companyCode') == companyCode) && (newRenewal == 0 || $$.get('.newRenewal') == newRenewal);
        }
        setup() {
            setDfeCustomStyle(`
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
    			    background-color: gray;
    			    border: 1px solid lightgray;
    			    border-radius: 3px;
    			    padding: 0px 1px;
    			    font-weight: normal;
    		    }
    		    
    		    .header-button-flip {
    		        transform: rotate(180deg);
    		        background-color: gray;
    		        border: 1px solid lightgray;
    		        border-radius: 3px;
    		        padding: 0px 1px;
    		        font-weight: normal;
    		    }
    		    
    		    .header-button:active {
    		        transform: scale(0.8);
    		    }
    		    
    		    .header-button-flip:active {
    		        transform: rotate(180deg) scale(0.8);
    		    }
    		    
    		    .wrong-date {
    		        background: antiquewhite;
    		    }
    		    
    		    .label-centered {
    		        display: block; 
    		        text-align: center; 
    		        width: 100%;
    		    }`, this.name);
        }
    }();
});