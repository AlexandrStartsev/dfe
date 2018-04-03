defineForm("dashboard/quicksearch", [ "components/c-dropdown", "components/editbox", "components/button", "components/form" ], function(__c_c_dropdown, __c_editbox, __c_button, __c_form) {
    return new class {
        constructor() {
            this.dfe = __c_form("qs", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    action: '/tools/work/QuoteSearch.do',
                    method: 'post'
                })
            }, [ __c_c_dropdown("qs-crit", {
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
            }), __c_editbox("qs-value", {
                get: $$ => $$('qs-' + $$('qs-crit')),
                set: ($$, value) => $$.set('qs-' + $$('qs-crit'), value),
                atr: $$ => ({
                    pattern: $$('qs-crit') == 'policyNumber' ? '.{1,32}' : '\\d{1,12}',
                    name: 'com.arrow.tools.reports.app.commercial.workerscomp.SubmittedApplicationsReport.' + $$('qs-crit')
                }),
                pos: [ {
                    colstyle: "display: inline; padding: 2px 2px"
                } ]
            }), __c_button("qs-submit", {
                get: $$ => 'Search',
                atr: $$ => ({
                    type: 'submit',
                    style: 'padding: 0px 5px'
                }),
                pos: [ {
                    colstyle: "display: inline"
                } ]
            }), __c_editbox("field-53", {
                get: $$ => 'com.arrow.tools.reports.app.commercial.workerscomp.SubmittedApplicationsReport',
                atr: $$ => ({
                    name: 'com.arrow.reports.reportId'
                }),
                pos: [ {
                    colstyle: "display: none"
                } ]
            }), __c_editbox("field-54", {
                get: $$ => '/tools/commercial/workerscomp/application_search.jsp',
                atr: $$ => ({
                    name: 'com.arrow.reports.referrer'
                }),
                pos: [ {
                    colstyle: "display: none"
                } ]
            }) ]);
        }
        onstart($$){
        	$$.set('qs-crit', 'submissionId')
        }
    }();
});