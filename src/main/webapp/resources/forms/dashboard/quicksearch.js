define([ "dfe-core", "components/labeled-dropdown", "components/editbox", "components/button", "components/html-form" ], function(Core, LabeledDropdown, Editbox, Button, HtmlForm) {
    let Form = Core.Form;
    return class QuickSearchForm extends Form {
        constructor(node) {
            super(node);
            node.unboundModel.set('qs-crit', 'submissionId')
        }
        static fields() {  
            return Form.field(HtmlForm, "qs", {
                atr: $$ => ({
                    action: '/tools/work/QuoteSearch.do',
                    method: 'post'
                })
            }, [ Form.field(LabeledDropdown, "qs-crit", {
                get: $$ => ({
                    value: $$.get('qs-crit'),
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
                layout: [ {
                    style: "display: inline; padding: 2px 2px"
                }, {
                    style: "display: inline"
                } ]
            }), Form.field(Editbox, "qs-value", {
                get: $$ => $$.get('qs-' + $$.get('qs-crit')),
                set: ($$, value) => $$.set('qs-' + $$.get('qs-crit'), value),
                atr: $$ => ({
                    pattern: $$.get('qs-crit') == 'policyNumber' ? /.{1,32}/ : /\d{1,12}/,
                    name: 'com.arrow.tools.reports.app.commercial.workerscomp.SubmittedApplicationsReport.' + $$.get('qs-crit')
                }),
                layout: [ {
                    style: "display: inline; padding: 2px 2px"
                } ]
            }), Form.field(Button, "qs-submit", {
                get: $$ => 'Search',
                atr: $$ => ({
                    type: 'submit',
                    style: 'padding: 0px 5px'
                }),
                layout: [ {
                    style: "display: inline"
                } ]
            }), Form.field(Editbox, "field-53", {
                get: $$ => 'com.arrow.tools.reports.app.commercial.workerscomp.SubmittedApplicationsReport',
                atr: $$ => ({
                    name: 'com.arrow.reports.reportId'
                }),
                layout: [ {
                    style: "display: none"
                } ]
            }), Form.field(Editbox, "field-54", {
                get: $$ => '/tools/commercial/workerscomp/application_search.jsp',
                atr: $$ => ({
                    name: 'com.arrow.reports.referrer'
                }),
                layout: [ {
                    style: "display: none"
                } ]
            }) ]);
        }
    }
})