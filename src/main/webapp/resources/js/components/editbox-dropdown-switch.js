define('components/editbox-dropdown-switch', ['components/dual-with-label', 'components/editbox', 'components/dropdown', 'ui-utils'], function(DWC, Editbox, Dropdown, uiUtils) {
    function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
    function defer(c, d, e, a, t) { delete c._deferred; return !c.allParentNodes && (c._deferred = function() {c.component.render(c, d, e, a, t)}) }
    var e = _extend(Editbox, {}), d = _extend(Dropdown, {}), sa = new Set();
    DWC.skipattrs.forEach(function(a) {sa.add(a)});
    sa.add('editbox');
    e.skipattrs = d.skipattrs = sa;
    return _extend({
        name: 'editbox-dropdown-switch',
        skipattrs: sa,
        renderingComponent: e,
        render: function(control, data, errs, attrs, events) { 
            if(!defer(control, data, errs, attrs, events)) {
                var rc = attrs.editbox ? e : d, rt = this.runtime(control);
                if( rc != rt.renderingComponent ) {
                    this.emptyUI(control);
                    rt.renderingComponent = rc;
                }
                this.renderingComponent = rt.renderingComponent;
                DWC.render.call(this, control, attrs.editbox ? data.value : data, errs, attrs, events);
            }
        }
    }, DWC, {});
})