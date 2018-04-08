define('components/dfe-table', ['components/container', 'ui/utils'], function(Container, uiUtils) {
    function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
    function defer(p, c, d, e, a, t) { return c._deferred = p ? 0 : function(p) {c.component.render(p, c, d, e, a, t)} }  
    var tables = new Set();
    function process(control){
        for(var trs = control.ui ? control.ui.querySelectorAll('tr') : [], n = trs.length, i = 0, flag=true, tr, td; i < n; i++) {
            tr = trs[i], td = tr.firstChild;
            td.firstChild && td.firstChild.tagName == 'TABLE' || uiUtils.setAttribute(tr, 'dfe-color', (flag = !flag) ? '' : 0);
        }
    }
    function processAll() {
        tables.forEach(process);
    }
    ['keyup', 'mouseup'].forEach(function(n){
        document.addEventListener(n, function(e){
            for(var t = e.target; t; t = t.parentNode) { 
                if(t._dfe_ && t._dfe_.component.cname == 'dfe-table') {
                    t._dfe_.model.runtime.schedule.push( processAll );
                    break ; 
                }
            }
        }, false)
    });
    return _extend({
        cname: 'dfe-table',
        attachUI: function (control, nodes) {
            Container.attachUI.call(this, control, nodes);
            tables.add(control);
        },
        detachUI: function(control) {
            tables.delete(control);
            Container.detachUI.call(this, control);
        },
        renderFx: function(nodes, control, data, errs, attrs) {
            Container.renderFx.call(this, nodes, control, data, errs, attrs);
            tables.add(control);
        },
        render: function (nodes, control, data, errs, attrs, events) {
            Container.render.call(this, nodes, control, data, errs, attrs, events);
            control.model.runtime.schedule.push( process.bind(null, control) );
            if(control.ui) {
                var c = control.ui.getAttribute('class');
                c.match(/dfe-table/) || uiUtils.setAttribute(control.ui, 'class', 'dfe-table ' + c);
            }
        }
    }, Container, Container.base())
})