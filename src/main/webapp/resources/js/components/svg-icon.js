define('components/svg-icon', ['components/component', 'ui/utils', 'module', 'ui/jquery'], function(Component, uiUtils, m, jq) {
    function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
    var uri = m.uri.replace(m.id+'.js', 'ui/images/icons.svg'), ua = window.navigator.userAgent;
    var ie = ua.indexOf("MSIE") != -1 || ua.indexOf("Trident");
    var loaded = false, afterLoad = new Map();
    jq.get(uri,'xml').done(function(doc) {
        var h = document.head || document.getElementsByTagName('head')[0];
        var b = h.appendChild(document.createElement('div'));
    	uiUtils.setAttribute(b, 'style', 'display: none');
        for(var n = doc.querySelectorAll('head > style'), i = n.length; i; h.appendChild(document.createElement('style')).appendChild(n[--i].firstChild) );
        for(var n = doc.querySelectorAll('body > *'), i = n.length; i; b.appendChild(n[--i]));
        loaded = true;
        afterLoad.forEach(function(v) {v()});
        afterLoad.clear();
    	/*
        var d = document.head || document.getElementsByTagName('head')[0];
        d = d.appendChild(document.createElement('div'));
    	uiUtils.setAttribute(d, 'style', 'display: none');
    	for(var n = doc.querySelectorAll('svg[id]'), i = n.length; i; d.appendChild(n[--i])); */
    }).fail(function(){ console.warn(arguments)});
    function defer(c, d, e, a, t) { 
        if(c.allParentNodes && loaded) return c._deferred = 0;
        c._deferred = function() {c.component.render(c, d, e, a, t)} 
        loaded || afterLoad.set(c, c._deferred)
        return c._deferred 
    }
    var clone = +ua.replace(/^.+Firefox\/(\d+)/,'$1') < 56;
    return _extend({
        name: 'svg-icon',
        render: function (control, data, errs, attrs, events) {
            if(!defer(control, data, errs, attrs, events)) {
                if(clone) {
                    control.ui && control.parentNode && control.parentNode.removeChild(control.ui);
                    control.ui = document.getElementById(data).cloneNode(true);
                    control.ui.removeAttribute('id');
                    control.parentNode && control.parentNode.appendChild(control.ui);
                    control.ui._dfe_ = control;
                    this.setEvents(control.ui, control, data, errs, attrs);
                } else {
                    if(!control.ui) {
                        control.ui = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        control.ui.appendChild(control.useUI = document.createElementNS('http://www.w3.org/2000/svg', 'use'));
                        control.ui._dfe_ = control;
                        control.parentNode && control.parentNode.appendChild(control.ui);
                        this.setEvents(control.ui, control, data, errs, attrs);
                    }
                    control.useUI.setAttribute('href', '#' + data);
                }
                this.setAttributes(control, data, errs, attrs);
                this.appendError(control, control.parentNode, errs, attrs);
            }
        }
    }, Component, {})
})