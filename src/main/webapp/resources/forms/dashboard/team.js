define([ "dfe-core", "forms/dashboard/statusgrid", "forms/dashboard/notes", "forms/dashboard/common", "ui/jquery-ui", "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "components/html", "components/label", "components/div", "components/labeled-editbox", "components/labeled-dropdown", "components/editbox", "components/button", "components/table", "components/either" ], function(Core, StatusGridForm, notes, dashboardCommon, jq, cmn, uiUtils, shapes, fields, Html, Label, Div, LabeledEditbox, LabeledDropdown, Editbox, Button, Table, Either) {
    let Form = Core.Form;
    let detailGridColumns = [ 'quoteid', 'accountName', 'companyCode', 'effectiveDate', 'writtenPremium', 'userId', 'reassign' ];
    let detailsGridClass = 'team-rbody-tbl';
    
    class TeamForm extends Form {
        constructor(node) {
            super(node);
            let $$ = node.unboundModel;
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
            this.userIdToTeam.then(map => map.forEach((_, userId) => $$.get('userReassign') == 0 && $$.set('userReassign', userId)));
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
            }, [ Form.field(Div,"field-2", {
                class: "header",
                layout: [ {
                    colSpan: "4"
                } ]
            }, [ Form.field(Html,"field-49", {
                get: $$ => shapes.cssShape($$, $$.get('filterCollapsed') == 'Y' ? 'css-button-plus' : 'css-button-minus'),
                atr: $$ => ({
                    events: {
                        onClick: () => $$.set('filterCollapsed', $$.get('filterCollapsed') == 'Y' ? 'N' : 'Y')
                    }
                }),
                layout: [ {
                    style: "display: inline-block; float: left; padding: 1px; background: white; border-radius: 3px;"
                } ]
            }), Form.field(Label,"field-48", {
                get: () => 'Report Filter',
                layout: [ {
                    style: "display: inline-block; padding: 0px 100px"
                } ]
            }) ]), Form.field(LabeledEditbox,"field-4", {
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
            }), Form.field(LabeledEditbox,"field-6", {
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
            }), Form.field(Table, "field-1", {
                layout: [ {
                    newRow: true,
                    colSpan: "4"
                } ]
            }, [ Form.field(LabeledDropdown,"field-8", {
                get: function($$) {
                    return {
                        value: $$.get('.teamFilter'),
                        items: [ {
                            value: '',
                            description: 'All'
                        } ].concat($$.get('team').filter(team => team.get('.quotes.rows').length).map(team => team.get('.name')))
                    };
                },
                set: ($$, value) => {
                	$$.set({teamFilter: value, userFilter: ''});
                	let team = $$.get('team').filter(team => team.get('.name') == value).shift();
                	team && team.set('.expanded', 'Y')
                },
                atr: () => ({
                    text: 'Team Filter:'
                })
            }), Form.field(LabeledDropdown,"field-10", {
                get: function($$) {
                    this.userIdToTeam.then(map => {
                        let users = [], teamFilter = $$.get('.teamFilter').toString();
                        map.forEach((def, userId) => (teamFilter == 0 || def.groups.indexOf(teamFilter) >= 0) && $$.get('team.quotes.rows.userId').indexOf(userId) != -1 && users.push({
                            value: userId,
                            description: def.fullname
                        }));
                        $$.result({
                            value: $$.get('.userFilter'),
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
            }) ]) ]), Form.field(Table, "re;ass", {
                atr: () => ({
                    class: 'dashboard-table reassign-tbl',
                    style: 'width: 350px; float: right'
                })
            }, [ Form.field(Label,"field-12", {
                class: "header",
                get: () => 'Application Re-Assignment',
                layout: [ {
                    colSpan: "3"
                } ]
            }), Form.field(LabeledDropdown,"field-13", {
                get: function($$) {
                    this.userIdToTeam.then(map => {
                        let users = [];
                        map.forEach((def, userId) => users.push({
                            value: userId,
                            description: def.fullname
                        }));
                        $$.result({
                            value: $$.get('userReassign'),
                            items: users
                        });
                    });
                },
                set: ($$, value) => $$.set('userReassign', value),
                val: $$ => !TeamForm.isMassRolloverAllowed($$) && $$.error('Feature requires mass rollover permission'),
                atr: $$ => ({
                    text: 'Re-Assign To:',
                    vstrategy: 'always'
                })
            }), Form.field(Button,"field-14", {
                get: $$ => 'Finalize',
                set: function($$) {
                    this.doMassRollover($$)
                },
                atr: $$ => ({
                    style: 'float: right',
                    disabled: !TeamForm.isMassRolloverAllowed($$) || $$.get('team.quotes.rows.reassign').indexOf('Y') == -1
                })
            }) ]), Form.field(Div,"loader", {
                get: function($$) {
                    let effFrom = $$.get('criteria.effFrom'), effTo = $$.get('criteria.effTo');
                    cmn.ARFtoDate(effFrom) instanceof Date && cmn.ARFtoDate(effTo) instanceof Date && this.loadTeams($$.unbound, effFrom, effTo);
                    return [ $$ ];
                },
                atr: () => ({
                    style: 'width: 100%; position: relative;'
                }),
                layout: [ {
                    newRow: true,
                    colSpan: "2"
                } ]
            }, [ Form.field(Html,"loading", {
                get: $$ => shapes.cssShape($$, 'css-loading-anim-circle'),
                atr: $$ => ({
                    class: 'loading-overlay',
                    style: `display: ${$$.get('team.loading') == 0 ? 'none' : ''}`
                })
            }), Form.field(Table, "teams", {
                get: $$ => $$.get('team'),
                atr: function($$) {
                    let _team = $$.get('criteria.teamFilter').toString(), _user = $$.get('criteria.userFilter').toString();
                    return {
                        class: 'dashboard-table team-table',
                        style: 'width: 100%',
                        filter: team => (_team == 0 || team.get('.name') == _team) && team.get('.quotes.rows.userId').filter(user => _user == 0 || user == _user).length > 0,
                        skip: _team == 0 ? [] : ['field-3', 'field-5', 'field-11']
                    }
                },
                layout: [ {
                    newRow: true,
                    colSpan: "2"
                } ]
            }, [ Form.field(Label,"field-3", {
                class: "header",
                get: () => 'Team Name',
                layout: [ {
                    style: "width: 150px; min-width: 150px"
                } ]
            }), Form.field(Label,"field-5", {
                class: "header",
                get: () => ''
            }), Form.field(Div,"field-11", {
                atr: $$ => ({
                    style: 'display: flex;'
                })
            }, [ Form.field(Html,"field-7", {
                get: $$ => shapes.cssShape($$, $$.get('.expanded') == 'Y' ? 'css-button-minus' : 'css-button-plus'),
                atr: $$ => ({
                    style: 'width: 12px; height: 12px;',
                    events: {
                        onClick: () => $$.set('.expanded', $$.get('.expanded') == 'Y' ? 'N' : 'Y')
                    }
                })
            }), Form.field(Label,"field-9", {
                get: $$ => $$.get('.name'),
                layout: [ {
                    style: "padding: 3px; white-space: nowrap"
                } ]
            }) ]), Form.field(Either, "rwrap", { atr: $$ => ({ first: $$.get('.expanded') != 'Y' }) }, 
                Form.field(Label,"field-21", {
                    get: $$ => '...',
                    layout: [ { style: 'display:block; text-align: center;' } ]
                }), 
                Form.field(StatusGridForm,"team", {
                    config: {
                        rowFilterMaker: $$ => TeamForm.makeRowFilter($$),
                        skipColumns: colName => detailGridColumns.indexOf(colName.replace(/^.*\./, '')) == -1,
                        tableClass: detailsGridClass
                    }
                })
            ) ] ) ]) ])
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
            let effFrom = $$.get('criteria.effFrom'), effTo = $$.get('criteria.effTo'), reload = cmn.ARFtoDate(effFrom) instanceof Date && cmn.ARFtoDate(effTo) instanceof Date;
            reload ? $$.set('team.loading', 1) : alert('request has been submitted. Please correct date range to update grid results');
            jq.post('/services/SubmittedApplicationService/Applications/Update', JSON.stringify(requests), 'json').done(() => 
            	reload && this.loadTeams($$, effFrom, effTo)
            )
        }
        static makeRowFilter($$) {
            let userId = $$.get('criteria.userFilter').toString();
            return $$ => userId == 0 || $$.get('.userId') == userId;
        }
        static isMassRolloverAllowed($$) {
            return $$.get('features.massRollover') != 0;
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
    setupStyle(TeamForm.name, detailGridColumns, detailsGridClass);
    return TeamForm;
})