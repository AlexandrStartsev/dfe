// https://docs.angularjs.org/guide/component

define("components/editable-field", ['components/component' ], function(CComponent) {
    return (function () { for(var a=arguments,i=a.length-1,to=a[i],from;from=a[--i];)for(var key in from) to[key]=from[key]; return to; })({
        cname: 'editable-field',
        render: function (control, data, errs, attrs, events) {
            control.ui || (control.ui = document.createElement('div')).setAttribute('style', 'display: inline'), control.parentNode && control.parentNode.appendChild(control.ui);
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

defineForm("a", [ "dfe-field-helper", "components/label", "components/editable-field", "components/button", "components/div" ], function(fields, __c_label, __c_editable_field, __c_button, __c_div) {
    return new class {
        constructor() {
            this.dfe = 
                __c_div("a", { get: $$ => $$('list') }, [
                    __c_label("b", { class: "header", get: () => 'Heroes' }), 
                    __c_label("c", { get: $$ => 'Name: ' + $$('.name') }),
                    __c_label("d", { get: () => 'Location:', pos: [ { colstyle: "display: inline" } ] }),
                    __c_editable_field("e", { atr: () => fields.simple('.location', []), pos: [ { colstyle: "display: inline" } ] }), 
                    __c_button("f", { get: () => 'Delete', set: $$ => $$.detach() }) 
                ]);
        }
    }();
});