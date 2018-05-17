define([ "dfe-core", "forms/dashboard/detailsgrid", "forms/dashboard/common", "dfe-common", "ui/utils", "ui/shapes", "components/html", "components/label", "components/div", "components/table", "components/either" ], function(Core, DetailsGridForm, dashboardCommon, cmn, uiUtils, shapes, Html, Label, Div, Table, Either) {
    let Form = Core.Form;
    return class StatusGridForm extends Form{
        static fields(_, config) {
            return Form.field(Table, "filtered", {
                get: $$ => $$.get('.quotes'),
                atr: $$ => ({
                    class: 'dashboard-table',
                    style: 'width: 100%;',
                    filter: res => res.get('.rows').filter(config.rowFilterMaker($$)).length > 0,
                    order: (res1, res2) => Number(res1.get('.order')) - Number(res2.get('.order'))
                })
            }, [ Form.field(Div, "field-11", {
                atr: $$ => ({
                    wrap: true,
                    style: 'display: flex;'
                })
            }, [ Form.field(Html, "field-18", {
                get: $$ => shapes.cssShape($$, $$.get('.expanded') == 'Y' ? 'css-button-minus' : 'css-button-plus'),
                atr: $$ => ({
                    style: 'width: 12px; height: 12px;',
                    events: {
                        onClick: () => $$.set('.expanded', $$.get('.expanded') == 'Y' ? 'N' : 'Y')
                    }
                })
            }), Form.field(Label, "field-14", {
                get: $$ => $$.get('.status') + ' (' + $$.get('.rows').filter(config.rowFilterMaker($$)).length + ')',
                layout: [ {
                    style: "padding: 3px; white-space: nowrap;"
                } ]
            }) ]), Form.field(Label, "field-15", {
                class: "header",
                get: $$ => 'Status',
                layout: [ {
                    style: "width: 150px; min-width: 150px"
                } ]
            }), Form.field(Label, "field-16", {
                class: "header",
                get: $$ => 'Details',
                layout: [{ style: "width: 100%;" }]
            }), 
            Form.field(Either, "rwrap", { atr: $$ => ({ first: $$.get('.expanded') != 'Y' }) }, 
                Form.field(Label, "field-21", {
                    get: $$ => '...',
                    layout: [ { style: 'display:block; text-align: center;' } ]
                }), Form.field(DetailsGridForm, "details", { config: {...config} }) )
            ])
        }
    }
})