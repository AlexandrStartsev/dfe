define('components/editbox-dropdown-switch', ['components/labeled-component', 'components/switch', 'components/editbox', 'components/dropdown'], function(DWC, Switch, e, d) {
    function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
    return _extend({
        cname: 'editbox-dropdown-switch',
        renderingComponent: Switch,
        render: function(nodes, control, data, errs, attrs, events) { 
            DWC.render.call(this, nodes, control, attrs.editbox ? data.value : data, errs, _extend({ component: attrs.editbox ? e : d }, attrs), events) 
        }
    }, DWC, DWC.base())
})