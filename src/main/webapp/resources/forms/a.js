// https://docs.angularjs.org/guide/component

/*define("components/editable-field", ['components/component' ], function(CComponent) {
    return (function () { for(var a=arguments,i=a.length-1,to=a[i],from;from=a[--i];)for(var key in from) to[key]=from[key]; return to; })({
        cname: 'editable-field',
        render: function (nodes, control, data, errs, attrs, events) {
            control.ui || (control.ui = document.createElement('div')).setAttribute('style', 'display: inline'), nodes && nodes[0] && nodes[0].appendChild(control.ui);
            while(control.ui.firstChild) control.ui.removeChild(control.ui.firstChild);
            var a = control.ui.appendChild(document.createElement(control.editMode ? 'input' : 'label')), b, c;
            a.value = a.innerText = (Array.isArray(data)?data[0]:data)||'';
            control.ui.appendChild(b = document.createElement('button')).innerText = control.editMode ? 'Save' : 'Edit';
            b.addEventListener("click", function(e) {
                (control.editMode=!control.editMode) || control.component.store(control, control.initValue = a.value); 
                control.notifications.push({ action : 'self' });
            })
            control.editMode && (control.ui.appendChild(c = document.createElement('button')).innerText = 'Reset', control.initValue = data) && c.addEventListener("click", function(e) {
                a.value = control.initValue;
            })
        }
    }, CComponent, CComponent.base())
})

*/
defineForm("editable-field", [ "dfe-field-helper", "components/switch", "components/label", "components/editbox", "components/button", "components/div" ], function(fields, __c_switch, __c_label, __c_editbox, __c_button, __c_div) {
    return new class {
        constructor() {
            this.dfe = [ 
                 __c_switch("ef-1", { atr: $$ => fields.simple('value', [], {component: $$('editMode')!=0?__c_editbox:__c_label}) }), 
                 __c_button("ef-2", { get: $$ => $$('editMode')==0?'Edit':'Save', 
                                      set: $$ => {
                                          let e = $$('editMode');
                                          $$.set('editMode', e==0?1:0);
                                          e!=0 && this.store($$, $$('value'))
                                     }}),
                 __c_button("ef-3", { get: $$ => 'Reset', 
                                   set: $$ => $$.set('value', $$('initialValue')),
                                   atr: $$ => ({style: $$('editMode')==0?'display:none':''}) })
                ];
        }
        onstart($$) {
            $$.set('initialValue', $$.get('value'))
        }
    }();
});

/*defineForm("a", [ "dfe-field-helper", "ui/utils", "components/dfe-runtime", "components/editbox", "components/label", "forms/editable-field", "components/button", "components/div" ], function(fields, uiUtils, __c_dfe_runtime, __c_editbox, __c_label, __c_editable_field, __c_button, __c_div) {
    return new class {
        constructor() {
            this.dfe = 
                __c_div("a", { get: $$ => $$('list') }, [
                    __c_label("b", { class: "header", get: () => 'Heroes' }), 
                    __c_label("c", { get: $$ => `Name: ${$$('.name')}` }),
                    __c_label("d", { get: $$ => `Location:` }),
                    __c_dfe_runtime("e", {get: $$ => ({value: $$('.location')}), set: ($$, v) => $$.set('.location', v), atr: () => ({form: 'editable-field'}) }),
                    //__c_editable_field("e", { get: $$ => ({value: $$('.location')}), set: ($$, v) => $$.set('.location', v) }), 
                    __c_button("f", { get: () => 'Delete', set: $$ => $$.detach() }) 
                ]);
        }
    }();
});*/

defineForm("a", [ "components/dfe-runtime", "components/tab-d", "components/label" ], function(__c_dfe_runtime, __c_tab_d, __c_label) {
    return new class {
        constructor() {
            this.dfe = 
                __c_tab_d("a", { get: $$ => [{ caption: 'header-1', hfield: 'b'}, { caption: 'header-2', hfield: 'c'}], atr: () => ({haclass: 'tab-item-active'}) }, [
                    __c_label("hdr", { get: $$ => $$('.caption') }), 
                    //__c_label("b", { class: "header", get: () => 'Heroes' }), 
                    __c_label("b", { class: "header", get: $$ => `value: ${$$('.value')}`}),
                    __c_dfe_runtime("c", {class: "header", get: $$ => $$, set: ($$, v) => $$.set('.value', v), atr: () => ({form: 'editable-field'}) }),
                ]);
        }
    }();
});