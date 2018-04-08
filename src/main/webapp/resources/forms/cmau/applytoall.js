defineForm("cmau/applytoall", [ "dfe-common", "dfe-field-helper", "components/c-switch", "components/editbox", "components/editbox-$", "components/checkbox", "components/radiolist", "components/dropdown", "components/button" ], function(cmn, fields, __c_c_switch, __c_editbox, __c_editbox_$, __c_checkbox, __c_radiolist, __c_dropdown, __c_button) {
	return new class {
        constructor() {
            this.dfe = [
                __c_c_switch('applytoall-ctrl', {
                    atr: function($$) {
                        let a = this.attrs($$), def = {text: a.text, html: a.html, cstyle: a.cstyle, style: a.style};
                        switch(a.component) {
                            case 'dropdown':
                                return fields.choice(a.field, a.items, cmn.extend( { component: __c_dropdown }, def ) );
                            case 'radiolist':
                                return fields.simple(a.field, cmn.extend( { orientation: 'horizontal', component: __c_radiolist }, def ) );
                            case 'checkbox':
                                return fields.simple(a.field, [], cmn.extend( { component: __c_checkbox }, def ) );
                            case 'ajax-dropdown':
                                return fields.ajaxChoice(a.field, a.ajax, cmn.extend( { component: __c_dropdown }, def ) );
                            case 'editbox-$':
                                return fields.simple(a.field, cmn.extend( { formatting: '$9,999,999', component: __c_editbox_$ }, def ) );
                            case 'editbox':
                                return fields.simple(a.field, cmn.extend( { pattern: a.pattern, component: __c_editbox }, def ) );
                        }
                    }
                }), __c_button('applytoall-btn', {
                    get: $$ => 'Apply to all ' + this.attrs($$).all,
                    set: $$ => this.store($$, 'all'),
                    atr: $$ => ({
                        class: 'link-button'
                    })
                })
            ]
        }
    }
})
