defineForm("dashboard/notes", [ "require", "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "components/label", "components/textarea", "components/html", "components/div" ], function(require, cmn, uiUtils, shapes, fields, __c_label, __c_textarea, __c_html, __c_div) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => $$('.note'),
                atr: () => ({
                    order: (n1, n2) => n2.index() - n1.index()
                })
            }, [ __c_label("field-1", {
                get: $$ => `by <b>${$$('.user')}</b> on <i>${this.formatAsDate($$('.datetime'))}</i>`,
                atr: () => ({
                    html: true
                }),
                pos: [ {
                    colstyle: "padding-left:20px; display: block;"
                } ]
            }), __c_textarea("field-2", {
                atr: $$ => fields.simple('.subject', [], {
                    class: 'note-edit-ta',
                    disabled: $$('.isnew') == 0
                }),
                pos: [ {
                    colstyle: "display: block; width: calc(100% - 8px)"
                } ]
            }), __c_html("field-3", {
                class: "header",
                get: $$ => shapes.cssShape($$, 'css-button-plus'),
                atr: $$ => ({
                    events: {
                        click: () => $$.append('.note', {
                            user: $$('currentUser'),
                            datetime: this.now(),
                            isnew: 1
                        })
                    }
                }),
                pos: [ {
                    colstyle: "position: absolute; margin: 2px"
                } ]
            }) ]);
        }
        now() {
            let dt = new Date(), str = cmn.yyyymmdd(dt);
            [ dt.getHours(), dt.getMinutes() ].forEach(e => str += e > 9 ? e : '0' + e);
            return str;
        }
        formatAsDate(s) {
            return `${s.substring(4, 6)}/${s.substring(6, 8)}/${s.substring(0, 4)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
        }
        setup() {
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
        	`, this.name);
        }
    }();
});