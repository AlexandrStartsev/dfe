define([ "require", "dfe-core", "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "components/label", "components/textarea", "components/html", "components/div" ], function(require, Core, cmn, uiUtils, shapes, fields, Label, Textarea, Html, Div) {
    let Form = Core.Form;
    class NotesForm extends Form {
        static fields() {
            return (
                Form.field(Div, "root", {
                    get: $$ => $$('.note'),
                    atr: () => ({
                        order: (n1, n2) => n2.index() - n1.index()
                    })
                },  Form.field(Html, "field-3", {
                        class: "header",
                        get: $$ => shapes.cssShape($$, 'css-button-plus'),
                        atr: $$ => ({
                            events: {
                                onClick: () => $$.append('.note', {
                                    user: $$('currentUser'),
                                    datetime: NotesForm.now(),
                                    isnew: 1
                                })
                            }
                        }),
                        layout: [ {
                            style: "position: absolute; margin: 2px"
                        } ]
                    }), 
                    Form.field(Label, "field-1", {
                        atr: $$ => ({
                            html: `by <b>${$$('.user')}</b> on <i>${NotesForm.formatAsDate($$('.datetime'))}</i>`
                        }),
                        layout: [ {
                            style: "padding-left:20px; display: block;"
                        } ]
                    }), 
                    Form.field(Textarea, "field-2", {
                        atr: $$ => fields.simple('.subject', [], {
                            class: 'note-edit-ta',
                            disabled: $$('.isnew') == 0
                        }),
                        layout: [ {
                            style: "display: block; width: calc(100% - 8px)"
                        } ]
                    })
                )
            )
        }
        static now() {
            let dt = new Date(), str = cmn.yyyymmdd(dt);
            [ dt.getHours(), dt.getMinutes() ].forEach(e => str += e > 9 ? e : '0' + e);
            return str;
        }
        static formatAsDate(s) {
            return `${s.substring(4, 6)}/${s.substring(6, 8)}/${s.substring(0, 4)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
        }
    }
    uiUtils.setDfeCustomStyle(`
        .note-edit-ta {
            display: block; 
            width: 100%; 
            height: 50px; 
            resize: none; 
            border-radius: 5px; 
            outline: none;
            overflow: auto;
        }
    `, NotesForm.name);
    return NotesForm;
})