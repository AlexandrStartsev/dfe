defineForm([ "forms/dashboard/detailsgrid", "forms/dashboard/common", "dfe-common", "ui/utils", "ui/shapes", "components/html", "components/label", "components/div", "components/container" ], function(__f_detailsgrid, dashboardCommon, cmn, uiUtils, shapes, __c_html, __c_label, __c_div, __c_container) {
    return new class {
        constructor() {
            this.dfe = __c_container("filtered", {
                get: $$ => $$('.quotes'),
                atr: $$ => ({
                    class: 'dashboard-table',
                    style: 'width: 100%;',
                    filter: res => res.get('.rows').filter(this.params($$).rowFilter).length > 0,
                    order: (res1, res2) => Number(res1.get('.order')) - Number(res2.get('.order'))
            	})
            }, [ __c_div("field-11", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    style: 'display: flex;'
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
                get: $$ => $$('.status') + ' (' + $$('.rows').filter(this.params($$).rowFilter).length + ')',
                atr: $$ => ({
                    style: 'white-space: nowrap'
                }),
                pos: [ {
                    colstyle: "padding-top: 3px"
                } ]
            }) ]), __c_label("field-15", {
                class: "header",
                get: $$ => 'Status',
                pos: [ {
                    s: "width: 150px; min-width: 150px"
                } ]
            }), __c_label("field-16", {
                class: "header",
                get: $$ => 'Details'
            }), __c_div("rwrap", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    skip: $$('.expanded') == 'Y' ? 'field-21' : 'details'
                })
            }, [ __c_label("field-21", {
                get: $$ => '...',
                atr: $$ => ({
                    style: 'display:block; text-align: center;'
                })
            }), __f_detailsgrid("details", {
            	get: $$ => $$,
            	atr: $$ => this.params($$)
            }) ]) ])
            

        }
        onstart($$){
        	
        }
        setup() {
        	
        }
    }()
})