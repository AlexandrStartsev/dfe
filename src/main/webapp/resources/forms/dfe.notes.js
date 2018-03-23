defineForm("dfe.notes", [ "require", "dfe-common", "ui/utils", "ui/css-shapes", "dfe-field-helper", "components/div", "components/label", "components/textarea", "components/html" ], function(require, cmn, uiUtils, shapes, fields, __c_div, __c_label, __c_textarea, __c_html) {
    return new class {
        constructor() {
            this.dfe = [ {
                name: "root",
                component: __c_div,
                get: $$ => $$('.note'),
                atr: () => ({
                    order: (n1, n2) => n2.index() - n1.index()
                })
            }, {
                name: "field-1",
                component: __c_label,
                parent: "root",
                get: $$ => `by <b>${$$('.user')}</b> on <i>${this.formatAsDate($$('.datetime'))}</i>`,
                pos: [ {
                    colstyle: "padding-left:20px; display: block;"
                } ],
                atr: () => ({html: true})
            }, {
                name: "field-2",
                component: __c_textarea,
                parent: "root",
                atr: $$ => fields.simple('.subject', [], {
                    class: 'note-edit-ta',
                    disabled: $$('.isnew') == 0
                }),
                pos: [ {
                    colstyle: "display: block; width: calc(100% - 8px)"
                } ]
            }, {
                name: "field-3",
                component: __c_html,
                parent: "root",
                class: "header",
                get: $$ => shapes.sign('plus', 'green'),
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
            } ];
        }
        now() {
        	let dt = new Date(), str = cmn.yyyymmdd(dt);
        	[dt.getHours(), dt.getMinutes()].forEach(e => str += e > 9 ? e : '0' + e)
        	return str;
        }
        formatAsDate(s){
        	return `${s.substring(0,4)}/${s.substring(4,6)}/${s.substring(6,8)} ${s.substring(8,10)}:${s.substring(10,12)}`   
        }
        setup(){
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
        	`, this.name)
        }
    }();
});