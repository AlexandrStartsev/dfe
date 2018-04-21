defineForm([ "forms/dashboard/statusgrid", "forms/dashboard/notes", "forms/dashboard/common", "ui/jquery-ui", "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "components/html", "components/label", "components/div", "components/c-editbox", "components/c-dropdown", "components/editbox", "components/button", "components/container" ], function(__f_statusgrid, notes, dashboardCommon, jq, cmn, uiUtils, shapes, fields, __c_html, __c_label, __c_div, __c_c_editbox, __c_c_dropdown, __c_editbox, __c_button, __c_container) {
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
                    class: 'dashboard-table'
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
            }), __c_container("field-1", {
                get: $$ => [ $$ ],
                pos: [ {
                    n: "Y",
                    w: "4"
                } ]
            }, [ __c_c_dropdown("field-8", {
                get: function($$) {
                    return {
                        value: $$('.teamFilter'),
                        items: [ {
                            value: '',
                            description: 'All'
                        } ].concat($$('team').filter(team => team.get('.quotes.rows').length).map(team => team.get('.name')))
                    };
                },
                set: ($$, value) => {
                	$$.set({teamFilter: value, userFilter: ''});
                	let team = $$('team').filter(team => team.get('.name') == value).shift();
                	team && team.set('.expanded', 'Y')
                },
                atr: () => ({
                    text: 'Team Filter:'
                }),
                pos: [ {
                    n: "N"
                }, {} ]
            }), __c_c_dropdown("field-10", {
                get: function($$) {
                    this.userIdToTeam.then(map => {
                        let users = [], teamFilter = $$('.teamFilter').toString();
                        map.forEach((def, userId) => (teamFilter == 0 || def.groups.indexOf(teamFilter) >= 0) && $$('team.quotes.rows.userId').indexOf(userId) != -1 && users.push({
                            value: userId,
                            description: def.fullname
                        }));
                        $$.result({
                            value: $$('.userFilter'),
                            items: [ {
                                value: '',
                                description: 'All'
                            } ].concat(users)
                        });
                    });
                },
                set: ($$, value) => $$.set('.userFilter', value),
                atr: $$ => ({
                    text: 'Team Member Filter:'
                })
            }) ]) ]), __c_container("re;ass", {
                get: $$ => [ $$ ],
                atr: () => ({
                    class: 'dashboard-table reassign-tbl',
                    style: 'width: 350px; float: right'
                })
            }, [ __c_label("field-12", {
                class: "header",
                get: $$ => 'Application Re-Assignment',
                pos: [ {
                    w: "3"
                } ]
            }), __c_c_dropdown("field-13", {
                get: function($$) {
                    this.userIdToTeam.then(map => {
                        let users = [];
                        map.forEach((def, userId) => users.push({
                            value: userId,
                            description: def.fullname
                        }));
                        $$.result({
                            value: $$('userReassign'),
                            items: users
                        });
                    });
                },
                set: ($$, value) => $$.set('userReassign', value),
                val: $$ => !this.isMassRolloverAllowed($$) && $$.error('Feature requires mass rollover permission'),
                atr: $$ => ({
                    text: 'Re-Assign To:',
                    vstrategy: 'always'
                })
            }), __c_button("field-14", {
                get: $$ => 'Finalize',
                set: $$ => this.doMassRollover($$),
                atr: $$ => ({
                    style: 'float: right',
                    disabled: !this.isMassRolloverAllowed($$) || $$('team.quotes.rows.reassign').indexOf('Y') == -1
                })
            }) ]), __c_div("loader", {
                get: function($$) {
                    let effFrom = $$('criteria.effFrom'), effTo = $$('criteria.effTo');
                    cmn.ARFtoDate(effFrom) instanceof Date && cmn.ARFtoDate(effTo) instanceof Date && this.loadTeams($$.unbound, effFrom, effTo);
                    return [ $$ ];
                },
                atr: () => ({
                    style: 'width: 100%; position: relative;'
                }),
                pos: [ {
                    n: "Y",
                    w: "2"
                } ]
            }, [ __c_html("loading", {
                get: $$ => shapes.cssShape($$, 'css-loading-anim-circle'),
                atr: $$ => ({
                    class: 'loading-overlay',
                    style: `display: ${$$('team.loading') == 0 ? 'none' : ''}`
                })
            }), __c_container("teams", {
                get: $$ => $$('team'),
                atr: function($$) {
                    let _team = $$('criteria.teamFilter').toString(), _user = $$('criteria.userFilter').toString();
                    return {
                        class: 'dashboard-table team-table',
                        style: 'width: 100%',
                        filter: team => (_team == 0 || team.get('.name') == _team) && team.get('.quotes.rows.userId').filter(user => _user == 0 || user == _user).length > 0,
                        skip: _team == 0 ? [] : ['field-3', 'field-5', 'field-11']
                    };
                },
                pos: [ {
                    n: "Y",
                    w: "2"
                } ]
            }, [ __c_label("field-3", {
                class: "header",
                get: () => 'Team Name',
                pos: [ {
                    s: "width: 150px; min-width: 150px"
                } ]
            }), __c_label("field-5", {
                class: "header",
                get: () => ''
            }), __c_div("field-11", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    style: 'display: flex;'
                })
            }, [ __c_html("field-7", {
                get: $$ => shapes.cssShape($$, $$('.expanded') == 'Y' ? 'css-button-minus' : 'css-button-plus'),
                atr: $$ => ({
                    style: 'width: 12px; height: 12px; margin: 3px',
                    events: {
                        click: () => $$.set('.expanded', $$('.expanded') == 'Y' ? 'N' : 'Y')
                    }
                })
            }), __c_label("field-9", {
                get: $$ => $$('.name'),
                atr: $$ => ({
                    style: 'white-space: nowrap'
                }),
                pos: [ {
                    colstyle: "padding-top: 3px"
                } ]
            }) ]), __c_div("rwrap", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    skip: $$('.expanded') == 'Y' ? 'field-21' : 'team'
                })
            }, [ __c_label("field-21", {
                get: $$ => '...',
                atr: $$ => ({
                    style: 'display:block; text-align: center;'
                })
            }), __f_statusgrid("team", {
                get: $$ => $$,
                atr: $$ => ({
                    rowFilter: this.makeRowFilter($$),
                    skipColumns: colName => this.columns.indexOf(colName.replace(/^.*\./, '')) == -1,
                    tableClass: this.detailsClass
                })
            }) ]) ]) ]) ]);
        }
        loadTeams(px, effFrom, effTo) {
            this.userIdToTeam.then(map => {
                let users = '';
                map.forEach((def, userId) => {
                    users += '&userId=' + userId;
                    def.groups.forEach(grp => px.get('team.name').filter(n => n == grp) == 0 && px.append('team', {
                        name: grp
                    }));
                    def.proxyGroups = px.get('team').filter(t => def.groups.indexOf(t.get('.name').toString()) > -1);
                });
                px.set('team.loading', 1);
                jq.get(`/AJAXServlet.srv?method=DashboardScriptHelper&action=genTeamInfo${users}&lob=WORK&eff=${effFrom}&effTo=${effTo}&idKey=${++this.idKey}`, data => {
                    if (!data.idKey || +data.idKey > +this.lastProcessedKey) {
                        px.set('team.loading');
                        px.get('team.quotes.rows').forEach(px => px.detach());
                        this.lastProcessedKey = +data.idKey;
                        data && data.status == 'success' && data.result.forEach(row => {
                            map.get(row.userId).proxyGroups.forEach(px => {
                                let i = px.get('.quotes.status').indexOf(row.statusCode);
                                let quotes = i == -1 ? px.append('.quotes', {
                                    status: row.statusCode
                                }).shift() : px.get('.quotes')[i];
                                quotes.append('.rows', row);
                            });
                        });
                    }
                });
            });
        }
        doMassRollover($$) {
            let underwriter = $$.get('userReassign'), updateUser = $$.get('currentUser');
            let requests = $$.get('team.quotes.rows').filter(row => row.get('.reassign') == 'Y').map(row => ({
        		updateUser: updateUser, 
        		updateOption: 'underwriter',
        		applicationNumber: row.get(".quoteid"),
        		underwriter: underwriter,
        		beforeUpdateInfo: {
        			applicationNumber: row.get(".quoteid"),
        			producerCd: row.get('.producerCode').toString(),
        			underwriter: row.get(".userId"),
        			insuredName: row.get(".accountName").toString(),
        			status: row.get("..status"),
        			effectiveDate: row.get(".effectiveDate").toString().replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1')
        		}
            }))
            let effFrom = $$('criteria.effFrom'), effTo = $$('criteria.effTo'), reload = cmn.ARFtoDate(effFrom) instanceof Date && cmn.ARFtoDate(effTo) instanceof Date;
            reload ? $$.set('team.loading', 1) : alert('request has been submitted. Please correct date range to update grid results');
            jq.post('/services/SubmittedApplicationService/Applications/Update', JSON.stringify(requests), 'json').done(() => 
            	reload && this.loadTeams($$, effFrom, effTo)
            )
        }
        makeRowFilter($$) {
            let userId = $$.get('criteria.userFilter').toString();
            return $$ => userId == 0 || $$.get('.userId') == userId;
        }
        isMassRolloverAllowed($$) {
            return $$('features.massRollover') != 0;
        }
        onstart($$) {
        	this.userIdToTeam.then(map => map.forEach((_, userId) => $$.get('userReassign') == 0 && $$.set('userReassign', userId)));
        }
        setup() {
            this.idKey = this.lastProcessedKey = 0;
            this.userIdToTeam = new Promise(function(resolve) {
                jq.get(`/AJAXServlet.srv?method=TeamManagerScriptHelper&action=getGroupMap`, data => {
                    if (data && data.status == 'success') {
                        let map = new Map(), def;
                        data.result.users.forEach(user => map.set(user.name, def = {
                            fullname: user.fullname,
                            groups: Object.getOwnPropertyNames(user).filter(n => user[n] == "Y")
                        }));
                        resolve(map);
                    }
                });
            });
            this.columns = [ 'quoteid', 'accountName', 'companyCode', 'effectiveDate', 'writtenPremium', 'userId', 'reassign' ];
            this.detailsClass = 'team-rbody-tbl';
            this.style(this.name, this.columns, this.detailsClass);
        }
        style(name, columns, clazz) {
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
				
				.${clazz} td:nth-child(7n+${columns.indexOf('quoteid') + 1}) {
            		text-align: center;
				}
				
				.${clazz} td:nth-child(7n+${columns.indexOf('accountName') + 1}) {
				    min-width: 400px;
				}
				
				.${clazz} td:nth-child(7n+${columns.indexOf('companyCode') + 1}) {
				    text-align: center;
				}
				
				.${clazz} td:nth-child(7n+${columns.indexOf('effectiveDate') + 1}) {
            		text-align: center;
				}
				
				.${clazz} td:nth-child(7n+${columns.indexOf('writtenPremium') + 1}) {
            		text-align: right;
            		position: relative;
				}
				
                .${clazz} td:nth-child(7n+${columns.indexOf('writtenPremium') + 1})::before {
                    content: '$';
                    position: absolute;
                    font: 400 12px Arial;
                    left: 15px;
                }
                
				.${clazz} td:nth-child(7n+${columns.indexOf('userId') + 1}) {
            		text-align: left;
					padding-left: 10px;
				}
				
				.${clazz} td:nth-child(7n+${columns.indexOf('reassign') + 1}) {
            		text-align: center;
				}
                `, name);
        }
    }();
});