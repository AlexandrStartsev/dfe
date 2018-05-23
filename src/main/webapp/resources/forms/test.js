
define([ "dfe-core",
        "ui/shapes",
        'dfe-field-helper',
        "components/labeled-component", 
        "components/editbox", 
        "components/container", 
        "components/table",
        "components/button",
        "components/checkbox",
        "components/text",
        "components/dropdown",
        "components/html",
        "components/div-r",
        "components/tab-s",
        "components/tab-d",
        "components/div-c",
        "components/radiolist",
        "components/textarea",
       // "components/child-runtime",
        "components/div-button",
        "components/multioption",
        "components/labeled-editbox",
        "components/span",
        "components/inline-rows",
        "components/editbox-popup",         
        "components/modal",
        "components/div-r",
        "components/editbox-code-popup",
        "components/label" ], function(Core, shapes, fields, Labeled, Editbox, Container, Table, Button, Checkbox, 
            Text, Dropdown, Html, DivR, TabS, TabD, DivC, Radiolist, Textarea,// ChildRuntime, 
            DivButton, Multioption, LabeledEditbox, Span, InlineRows, EditboxPopup, Modal, Div, EditboxCodePopup, Label ) {
    let Form = Core.Form;

    let TestForm = class extends Core.Form {
        static fields() {
            return [
                Form.field(TabS, { get: $$ => $$.get('policy.cmau.location.car'), atr: () => ({ rowstyle$header: 'display: flex'}) }, [
                    Form.field(DivButton, 'header', { get: $$ => 'Car#' + $$.index(2), atr: () => ({ style: 'background: #bbb; border-radius: 2px; display: inline-block; margin: 2px'}) }),
                    Form.field(Editbox, "field-3", {
                        atr: () => fields.simple('.vinnumber', { vstrategy: 'always' })
                    }),
                    Form.field(Table, 'someTable', 
                        Form.field(Label, { get: () => 'header', class: 'header' })
                    )
                ])
            ]
        }
    }
    
    return TestForm;
});

define('forms/test2',[ "dfe-core",
        "ui/shapes",
        'dfe-field-helper',
        "components/labeled", 
        "components/editbox",
        "components/container",
        "components/checkbox",
        "components/table"], function(Core, shapes, fields, Labeled, Editbox, Container, Checkbox, Table) {
    let Form = Core.Form;
    
    return class SubForm2 extends Form {
        static fields() {
            return ([
                Form.field(Table, [
                    Form.field(Container, "field-2", { 
                        get: $$ => $$.get('.hideStuff') == 'Y' ? [] : [$$] 
                    }, [
                        Form.field(Editbox, "field-3", {
                            atr: () => fields.simple('.ModelYr', { vstrategy: 'always' })
                        })
                    ]),
                    Form.field(Checkbox, "field-4", { get: $$ => $$.get('.hideStuff'), set: ($$, value) => $$.set('.hideStuff', value) })
                ])
            ])
        }
    }  
})