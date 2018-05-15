define([ "require", "ui/utils", "dfe-core", "dfe-common", "components/div-button", "components/child-runtime", "components/tab-d", "components/div", "forms/dashboard/quicksearch", "module" ], function(require, uiUtils, Core, cmn, DivButton, ChildRuntime, TabD, Div, QuickSearchForm, module) {
    uiUtils.setDfeCustomStyle(`    		                
        .dashboard-tab-item {
            display: inline
        }

        .dashboard-tab-item > div {
            border: 1px solid #888;
            border-bottom: none;
            padding: 4px;
            border-radius: 5px 5px 0px 0px;
            display:inline-block;
            background: #97a47a;
            color: #fff;
            font-size: 16px;
            font-weight: bold;
        }

        .tab-item-active > div {
            padding: 5px;
            position: relative;
            top: 1px;
            z-index: 10;
            background: #f9e5bf;
            color: #666;
        }
    `, module.id);
    let Form = Core.Form;
    
    return class MyDashboard extends Form {
        static fields() {
            return Form.field(Div, "root", {
                atr: () => ({
                    style: 'display: table; background-color: white; width: 1500px; position: relative'
                })
            }, [ Form.field(TabD, "a", {
                get: $$ => [{caption: 'My Dashboard', field: 'myassignment'}].concat( $$('features.teamManager') == 0 ? [] : {caption: 'Team(s) Detail', field: 'team'} ).concat([{ caption: 'Diaries', field: 'diaries' }, { caption: 'Reports', field: 'reports' }]),
                set: ($$, px) => $$.set('currentTab', px.get('.field')),
                atr: $$ => ({
                    haclass: 'tab-item-active',
                    rowstyle$header: 'display: flex; align-items: flex-end;',
                    rowstyle$footer: 'border: 1px solid #888; border-radius: 0px 5px 5px 5px; padding: 2px; min-height: 320px;',
                    activeTab: function(px) {
                        let at = $$('currentTab').toString() || 'myassignment';
                        return px ? px.get('.field') == at : at;
                    }
                })
            }, [ Form.field(DivButton, "header", {
                    get: $$ => $$('.caption'),
                    layout: [ {
                        class: "dashboard-tab-item"
                    } ]
                }), Form.field(ChildRuntime, 'myassignment', {
                    class: "header",
                    atr: () => ({
                        form: 'dashboard/myassignment',
                        editTarget: true
                    })
                }), Form.field(ChildRuntime, 'team', {
                    class: "header",
                    atr: () => ({
                        form: 'dashboard/team',
                        editTarget: true
                    })
                }), Form.field(ChildRuntime, 'diaries', {
                    class: "header",
                    atr: () => ({
                        form: 'dashboard/diaries',
                        editTarget: true
                    })
                }), Form.field(ChildRuntime, 'reports', {
                    class: "header",
                    atr: () => ({
                        form: 'dashboard/reports',
                        editTarget: true
                    })
                }) ]), Form.field(QuickSearchForm, {
                    get: () => ({}),
                    layout: [ {
                        style: "position: absolute; right: 0px; top: 4px;"
                    } ]
                }) 
            ])
        }
    }
})