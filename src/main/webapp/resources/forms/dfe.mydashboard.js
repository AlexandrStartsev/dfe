defineForm([ "require", "ui/utils", "dfe-core", "dfe-common", "components/div-button", "components/dfe-runtime", "components/tab-d", "components/div", "forms/dashboard/quicksearch" ], function(require, uiUtils, core, cmn, __c_div_button, __c_dfe_runtime, __c_tab_d, __c_div, __f_quicksearch) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => [ $$ ],
                atr: () => ({
                    style: 'display: table; background-color: white; width: 1500px; position: relative'
                })
            }, [ __c_tab_d("a", {
                get: $$ => [{caption: 'My Dashboard', hfield: 'myassignment'}].concat( $$('features.teamManager') == 0 ? [] : {caption: 'Team(s) Detail', hfield: 'team'} ).concat([{ caption: 'Diaries', hfield: 'diaries' }, { caption: 'Reports', hfield: 'reports' }]),
                atr: $$ => ({
                    haclass: 'tab-item-active',
                    rowstyle$header: 'display: flex; align-items: flex-end;',
                    rowstyle$footer: 'border: 1px solid #888; border-radius: 0px 5px 5px 5px; padding: 2px; min-height: 320px;',
                    activeTab: tab => tab ? $$.set('currentTab', tab) : $$('currentTab') 
                })
            }, [ __c_div_button("header", {
                get: $$ => $$('.caption'),
                pos: [ {
                    colclass: "dashboard-tab-item"
                } ]
            }), __c_dfe_runtime("myassignment", {
                class: "header",
                get: $$ => $$,
                atr: () => ({
                    form: 'dashboard/myassignment',
                    editTarget: true
                })
            }), __c_dfe_runtime("team", {
                class: "header",
                get: $$ => $$,
                atr: () => ({
                    form: 'dashboard/team',
                    editTarget: true
                })
            }), __c_dfe_runtime("diaries", {
                class: "header",
                get: $$ => $$,
                atr: () => ({
                    form: 'dashboard/diaries',
                    editTarget: true
                })
            }), __c_dfe_runtime("reports", {
                class: "header",
                get: $$ => $$,
                atr: () => ({
                    form: 'dashboard/reports',
                    editTarget: true
                })
            }) ]), __f_quicksearch("qs", {
                get: () => ({}),
                pos: [ {
                    colstyle: "position: absolute; right: 0px; top: 4px;"
                } ]
            }) ]);
        }
        setup() {
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
            `, this.name);
        }
    }();
});