defineForm("cmau/applytoall", [ "dfe-common", "dfe-field-helper", "components/c-switch", "components/editbox", "components/editbox-$", "components/checkbox", "components/radiolist", "components/dropdown", "components/button" ], function(cmn, fields, __c_c_switch, __c_editbox, __c_editbox_$, __c_checkbox, __c_radiolist, __c_dropdown, __c_button) {
	return new class {
        constructor() {
            this.dfe = [
                __c_c_switch('applytoall-ctrl', {
                    set: ($$, value) => { this.store($$, value) },
                    atr: function($$) {
                        let a = this.params($$), def = {text: a.text, html: a.html, cstyle: a.cstyle, style: a.style}
                        switch(a.component) {
                            case 'dropdown':
                                return fields.choice('value', a.items, cmn.extend( { component: __c_dropdown }, def ) );
                            case 'radiolist':
                                return fields.simple('value', cmn.extend( { orientation: 'horizontal', component: __c_radiolist }, def ) );
                            case 'checkbox':
                                return fields.simple('value', [], cmn.extend( { component: __c_checkbox }, def ) );
                            case 'ajax-dropdown':
                                return fields.ajaxChoice('value', a.ajax, cmn.extend( { component: __c_dropdown }, def ) );
                            case 'editbox-$':
                                return fields.simple('value', cmn.extend( { formatting: '$9,999,999', component: __c_editbox_$ }, def ) );
                            case 'editbox':
                                return fields.simple('value', cmn.extend( { pattern: a.pattern, component: __c_editbox }, def ) );
                        }
                    }
                }), __c_button('applytoall-btn', {
                    get: $$ => 'Apply to all ' + this.params($$).all,
                    set: $$ => this.store($$, $$.get('value'), 'all'),
                    atr: $$ => ({
                        class: 'link-button'
                    })
                })
            ]
        }
    }
})
