define('components/typeahead', ['components/component', 'ui/utils', 'ui/jquery', 'ui/jquery-typeahead'], function(Component, uiUtils, jQuery) {
	function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
    return _extend({
        cname: 'typeahead',
        defaultOPTS: { source : {}, minLength: 1, maxItem: 8, maxItemPerGroup: 6, order: "asc", hint: true, searchOnFocus: true, debug: false, display: ['value','description'], template: '{{value}}: {{description}}', emptyTemplate: 'no result for {{query}}' },
        render: function (nodes, control, data, errs, attrs, events) {
            var rt = this.runtime(control), prevValue = '', self = this, s;
            if(!control.ui) {
                (control.ui = document.createElement('div'))._dfe_ = control;
                control.ui.innerHTML = '<div class="typeahead__field"><span class="typeahead__query"><input type="search" autocomplete="off"/></span></div>';
                control.ui.setAttribute('class', 'typeahead__container');
                self.setEvents(control.ui, control, data, errs, attrs);
                rt.node = control.ui.firstChild.firstChild.firstChild;
                rt.memorizedItem = {};
                opts = _extend( attrs && attrs.options, self.defaultOPTS );
                opts.callback = { onClickAfter: function (node, a, item, event) { control.component.store(control, rt.memorizedItem = item) } }
                jQuery(rt.node).typeahead( opts );
                nodes && nodes[0].appendChild(control.ui);
            }

            if( data && data.status != 'loading' ) {
                jQuery(rt.node).prop('disabled', false);
                jQuery(rt.node).typeahead('hideloading');
                jQuery(rt.node).typeahead( { source : { data : typeof attrs.filter == 'function' ? attrs.filter(data.items) : data.items} }, 'reload' );
                if(!data.found) {
                    if(data.items.length > 0) {
                        control.component.store(control, rt.memorizedItem = {});
                        jQuery(rt.node).typeahead('clean');
                    } else {
                        jQuery(rt.node).prop('disabled', true).val('No results found for given criteria');
                    }
                } else {
                    var match = true; for(v in data.value) match = match && rt.memorizedItem[v] == data.found[v];
                    match || (rt.memorizedItem = data.found);
                    rt.node.value = rt.memorizedItem[attrs.display || 'description'];     //jQuery(rt.node).typeahead('close');
                }
            } else 
                jQuery(rt.node).typeahead('showloading');
        },
        emptyUI: function(control) {
            if(control.ui) {
                jQuery(this.runtime(control).node).typeahead( 'destroy' );
                Component.emptyUI(control);
            }
        }
    }, Component, Component.base())
})