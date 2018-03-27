// https://docs.angularjs.org/guide/component

define("components/editable-field", ['components/component' ], function(CComponent) {
    return (function () { for(var a=arguments,i=a.length-1,to=a[i],from;from=a[--i];)for(var key in from) to[key]=from[key]; return to; })({
        name: 'editable-field',
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
    }, CComponent, {})
})

defineForm("a", [ "dfe-field-helper", "components/div", "components/editable-field", "components/button", "components/label" ], function(fields, __c_div, __c_editable_field, __c_button, __c_label) {
    return new class {
        constructor() {
            this.dfe = [ {
                name: "root1",
                component: __c_div,
                parent: "root",
                get: $$ => $$('list')
            } , {
                name: "f1",
                component: __c_label,
                parent: "root1",
                class: "header",
                get: $$ => 'Heroes'
            }, {
                name: "f2",
                component: __c_div,
                parent: "root1",
                get: $$ => [ $$ ]
            }, {
                name: "f3",
                component: __c_label,
                parent: "f2",
                get: $$ => 'Name: ' + $$('.name')
            }, {
                name: "f4",
                component: __c_label,
                parent: "f2",
                get: $$ => 'Location:',
                pos: [{ colstyle: "display: inline" }]
            }, {
                name: "f6",
                component: __c_editable_field,
                parent: "f2",
                atr: () => fields.simple('.location', []),
                pos: [{ colstyle: "display: inline" }]
            }, {
                name: "f9",
                component: __c_button,
                parent: "f2",
                get: () => 'Delete',
                set: $$ => $$.detach()
            } ];
        }
    }();
}); 