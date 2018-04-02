(function (){
    var sss = new Set();
    
	function _test(a, b) { if(a == 0) return b == 0; if(typeof a != 'object') return a == b; for(var i in a) if(a[i] != b[i]) return false; return true; }
	function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
    function defer(p, c, d, e, a, t) { return c._deferred = p ? 0 : function(p) {c.component.render(p, c, d, e, a, t)} }  
    function _base() { return function (n, f, c) { return _extend({name:n,children:c||[],component:arguments.callee},f) } }
	define('components/component', ['ui/utils'], function(uiUtils) {
	    return _extend({
	        cname: 'component',
	        isContainer: false,
            slots: 1,
            mapAttributes: function(attrs, map, override) {
                var ret = {}; for(var i in attrs) ret[ map.get(i) || i ] = override && typeof override[i] != 'undefined' ? override[i] : attrs[i]; return ret;
            },
	        toAttribute: (function(c){ var r = new Set(); c.forEach(function(a) {r.add(a)}); return r})([
	                                                                'name', 'id', 'disabled', 'hidden', 'readonly', 'maxlength', 'placeholder', 'spellcheck', 
	                                                                'class', 'style', 'type']),
	        setAttributesUI: function(ui, errs, attrs) { 
	            for(var i in attrs) {
                    this.toAttribute.has(i) && uiUtils.setAttribute(ui, i, attrs[i]);
	            }
	        },
	        setAttributes: function(control, errs, attrs) { 
	            this.setAttributesUI(control.ui, errs, attrs);
	        },
	        setParentNode: function(control, nodes) {
	            if(control._allParentNodes = nodes)
                    control._deferred ? ( control.ui && this.attachUI(control, nodes), control.notifications == 0 && control._deferred(nodes)) : this.attachUI(control, nodes)
                else
	            	this.detachUI(control);
	        },
            attachUI: function (control, nodes) {
                control.ui && nodes[0].appendChild(control.ui); 
	            control.errorUi && nodes[0].appendChild(control.errorUi);
            },
            detachUI: function (control) {
                uiUtils.removeNode(control.ui);
	        	uiUtils.removeNode(control.errorUi);
            },
	        emptyUI: function (control) {
                this.detachUI(control);
	        	delete control.ui;
                delete control.errorUi;
	        },
	        purge: function (control) { 
	            this.emptyUI(control); 
	        },
	        /* none - no validation. $$.error = ... is ignored on both client and server side. may be useful with ajaxFeed datasource
	           default/clean - validate if previously errored or when 'validate' notification received
	           followup - acts as 'clean' until first error (control.stickyError is undefined), then as 'notified' 
	           notified - validate if previously errored or when notified (non-empty event queue)
	           always - validate on every rendering cycle (including very first one, after creation)
	           extras:
	            - if 'disabled' word is added, control will validate as above even when attribute 'disabled' is set 
	            //- if 'post' word is added, control will be notified with 'validate' event when any  additionally after 
	         */
	        doValidation: function(control, events, attrs) { 
	            attrs || (attrs = {});
	            var vs = (attrs.vstrategy||'').split(' ');
	            if( vs.indexOf('none') != -1 ) return false;
	            if( ( vs.indexOf('disabled') == -1 && attrs.disabled) || attrs.hidden ) return false;
	            if( vs.indexOf('always') != -1 ) return true;
	            if( ( vs.indexOf('notified') != -1 || vs.indexOf('followup') != -1 && control.stickyError )
	                       && (control.error || events.length > 1 || events.length && events[0].action != 'init') ) return true;
	            return control.error || events.filter(function(e) { return 'validate' == e.action }) != 0; 
	        },
	        appendError: function(control, ui, errs, attrs) { 
	        	uiUtils.removeNode(control.errorUi);
                if( errs ) {
                    control.errorUi = document.createElement('label'); 
                    uiUtils.setAttribute(control.errorUi, 'class', attrs.eclass || 'dfe-error');
                    uiUtils.setAttribute(control.errorUi, 'style', attrs.estyle); // || 'color: #DB1260; font-weight: bold; display: block;'
                    control.errorUi.innerHTML = errs;
                    return ui && ui.appendChild(control.errorUi);
                }
                delete control.errorUi;
	        },
	        store: function(control, value, method) { control.model.runtime.store(control, value, method) },
	        render: function(nodes, control, model_proxy, errs, attrs, events) {},
	        layout: 'none',
	        runtime: function(control) { return control.runtime || (control.runtime={}) },
	        setEvents: function(ui, control, data, errs, attrs) {
	            for(var n in attrs.events) 
	                (function(a, e) { 
	                    if(typeof e == 'function') {
	                        var nm = a, t = ui, id, i=a.indexOf('$'); 
	                        uiUtils.addEventListener(t, nm, function(event) { 
	                        	return e.call(control.model.runtime.form, event, control) 
	                        }, false);
	                    }
	                })(n, attrs.events[n]);
	        },
            base: _base
	    }, _base())
	})
    
	define('components/editbox', ['components/component', 'ui/utils', 'components/date-picker-polyfill'], function(Component, uiUtils) {
	    var Patterning = function(v, p) { while(p && v != 0 && !(v.match(p) && v.match(p)[0] == v) ) v = v.substr(0, v.length-1); return v; }
	    var Formatting = function(value, format) { // aka XXX-XXX-XXXX or MM/DD/YYYY
	        if(format && typeof value !== 'undefined') {
	            var ret = '', i, j, vn, vl, fn, fl;
	            value = (Array.isArray(value) ? value[0] : value).toString().replace(/\W/g, '');
	            for (i = 0, j = 0; i < format.length && j < value.length; i++) {
	                vn = !(vl = value.charAt(j).match(/[A-Z]/i)) && !isNaN(parseInt(value.charAt(j)));
	                fn = !(fl = format.charAt(i) == '_') && 'XdDmMyY9'.indexOf(format.charAt(i)) >= 0;
	                if (fl && !vl || fn && !vn) break ;
	                ret += fl && vl || fn && vn ? value.charAt(j++) : format.charAt(i);
	            }
	            value = ret;
	        }
	        return value||'';
	    }
	    return _extend({
	        cname: 'editbox',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(attrs.transform) {
                        control.transform = [];
                        attrs.transform.split('').forEach(function(s) { control.transform.push(s.charCodeAt(0)-(s.charCodeAt(0) > 57 ? 55 : 48)) });
                    }
                    control.pattern = attrs.pattern;
                    control.formatting = attrs.formatting;
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('input'))._dfe_ = control;
                        control.ca = 0;
                        uiUtils.addEventListener(control.ui, 'keydown', function(e) {
                            var s = control.ui.selectionStart, v = control.ui.value, m; 
                            if((e.key == 'Backspace' || e.key == 'Delete' || e.key == 'Del') && control.formatting && v.length != control.ui.selectionEnd) {
                                e.preventDefault();
                                s && (control.ui.selectionEnd = --control.ui.selectionStart);  
                            } 
                            if(!e.key || e.key.length > 1 || e.ctrlKey) return ;
                            if(control.formatting) {
                                control.ca++;
                                if(e.key == control.formatting[s]) { control.ui.selectionStart++; e.preventDefault(); return ; }
                                while(control.formatting[s] && '_XdDmMyY9'.indexOf(control.formatting[s])==-1) s++;
                                var ol = v.length, nl = Formatting(v.substr(0, s) + e.key + v.substr(s + 1), control.formatting).length;
                                if(s < ol && nl >= ol || s >= ol && nl > ol ) {
                                    control.ui.value = control.ui.value.substr(0, s) + control.ui.value.substr(s + 1); 
                                    control.ui.selectionEnd = s; 
                                } else {
                                    e.preventDefault();
                                    return ;
                                }
                            }
                            if(control.pattern) {
                                m = (v = control.ui.value.substr(0, s) + e.key + control.ui.value.substr(control.ui.selectionEnd)).match(control.pattern);
                                (!m || m[0] != v) && (control.ca--, e.preventDefault());
                            }
                        }, false);
                        var store = function() { 
                            var f = control.formatting, p = control.pattern, data = Patterning(Formatting(control.ui.value, f), p); 
                            if(control.transform) { 
                                var t = []; for(var i=0;i<control.transform.length; i++)
                                    data.length > control.transform[i] && (t[i] = data.charAt(control.transform[i]));
                                for(var i=0;i<t.length; i++) 
                                    t[i] = t[i]||' ';
                                data = t.join('');
                            }
                            delete control.inputLock;
                            control.notifications.push({ action : 'self' }); 
                            control.component.store(control, data); 
                        }
                        uiUtils.addEventListener(control.ui, 'keydown', function() { control.inputLock = true; })
                        uiUtils.addEventListener(control.ui, attrs.trigger||'keyup', store);
                        attrs.trigger == 'change' || uiUtils.addEventListener(control.ui, 'change', store);
                        this.setEvents(control.ui, control, data, errs, attrs);
                    }
                    Array.isArray(data) && (data=data[0]), data || (data=''), data = data.toString();
                    if(control.transform) { 
                        var t = []; for(var i=0;i<data.length; i++) 
                            control.transform.length > i && (t[control.transform[i]] = data.charAt(i));
                        data = t.join('');
                    }
                    data = Patterning(Formatting(data, control.formatting), control.pattern);
                    if(data != control.ui.value && !control.inputLock) {
                        var v = control.ui.value, ss = control.ui.selectionStart;
                        control.ui.value = data;
                        if(control.formatting && ss >= control.ca && ss <= v.length && v != control.ui.value) {
                           var over = control.formatting.substr(ss-control.ca, control.ca).replace(/[_XdDmMyY9]/g,'').length;
                           if(control.ui.ownerDocument.activeElement == control.ui)
                               control.ui.selectionEnd = control.ui.selectionStart = ss + over; 
                        }
                        control.ca = 0;
                    }
                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                }
	        },
	        setAttributes: function(control, errs, attrs) { 
	            attrs.placeholder = attrs.disabled ? '' : control.formatting || attrs.placeholder;
	            Component.setAttributes.call(this, control, errs, attrs);
	        },
	        appendError: function(control, ui, errs, attrs) {
	            if(attrs.eclass) 
	            	uiUtils.setAttribute(control.ui, 'class', (attrs['class']||'') + (errs ? (attrs['class'] ? ' ' : '') + attrs.eclass : ''));
	            else 
	                Component.appendError.call(this, control, ui, errs, attrs);
	        }
	    }, Component, _base())
	})
	
	define('components/editbox-$', ['components/editbox', 'ui/utils'], function(CEditbox, uiUtils) {
	    var Formatting = function(v, n, l) {
	        do {
	            v = (n?'':'$') + v.replace(/[^\d]/g,'').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
	        } while(l && v.length > l && (v=v.substr(0, v.length-1)));
	        return v;
	    }
	    return _extend({
	        cname: 'editbox-$',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    control.maxlength = attrs.formatting && attrs.formatting.length;
                    control.nodollar = attrs.formatting && attrs.formatting.charAt(0) != '$';
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('input'))._dfe_ = control;
                        uiUtils.addEventListener(control.ui, 'keydown', function(e) {
                            var ml = control.maxlength < Formatting(control.ui.value + '1', control.nodollar, 99).length;
                            if(e.key == ',' && control.ui.value.charAt(control.ui.selectionStart) == ',') control.ui.selectionStart++;
                            !e.ctrlKey && e.key && e.key.length == 1 && control.ui.selectionStart == control.ui.selectionEnd && (e.key < '0' || e.key > '9' || ml) && e.preventDefault();
                        }, false);
                        var store = function() { 
                            delete control.inputLock;
                            var v = Formatting(control.ui.value, control.nodollar, control.maxlength);
                            control.notifications.push({ action : 'self' }); control.component.store(control, v.replace(/[^\d]/g,'')); 
                        }
                        uiUtils.addEventListener(control.ui, 'keydown', function() { control.inputLock = true; })
                        uiUtils.addEventListener(control.ui, attrs.trigger||'keyup', store);
                        attrs.trigger == 'change' || uiUtils.addEventListener(control.ui, 'change', store);
                        this.setEvents(control.ui, control, data, errs, attrs);
                    }
                    Array.isArray(data) && (data=data[0]);
                    if(!control.inputLock) {
                        if(typeof data == 'string' || typeof data == 'number') {
                            var ss = control.ui.selectionStart, ov = control.ui.value, nv = Formatting(data, control.nodollar, control.maxlength), o = 0;
                            if(ov != nv) {
                                control.ui.value = nv;
                                if(control.ui == document.activeElement) {
                                    for(i=0;i<ss;i++) (nv.charAt(i) == ',' || nv.charAt(i) == '$') && o++, (ov.charAt(i) == ',' || ov.charAt(i) == '$') && o--;
                                    if(control.ui.ownerDocument.activeElement == control.ui)
                                        control.ui.selectionStart = control.ui.selectionEnd = ss + o - (ov.charAt(ss) == ',' && nv.charAt(ss + o - 1) == ',' ? 1 : 0);
                                }
                            }
                        } else control.ui.value = '';
                    }

                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                }
	        }
	    }, CEditbox, _base())
	})
    
	define('components/dropdown', ['components/component', 'ui/utils'], function(Component, uiUtils) {
	    return _extend({
	        cname: 'dropdown',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('select'))._dfe_ = control;
                        uiUtils.addEventListener(control.ui, 'change', function(e){
                            control.component.store(control, control.ui.options[control.ui.selectedIndex].value);
                        }, true);
                        this.setEvents(control.ui, control, data, errs, attrs);
                    }
                    var s = 0, i = 0, opt, d = [], nx;
                    attrs['default'] && (!Array.isArray(attrs['default']) || (attrs['default']={value: attrs['default'], description: 'Please select...'})) && d.push(attrs['default']);
                    data = (Array.isArray(data) ? data[0] : data) || {};
                    Array.isArray(data.items) && (d = d.concat(data.items));
                    data.value = (Array.isArray(data.value) ? data.value[0] : data.value) || 0;
                    var currentNode = control.ui.firstChild;
                    d.forEach(function(v) {
                        currentNode || control.ui.appendChild(currentNode = document.createElement('option'));
                        if(typeof v == 'string' || typeof v == 'number') {
                            currentNode.text = currentNode.value = v;
                            if(data.value == v) s = i;
                        } else {
                            currentNode.value = v.value;
                            currentNode.text = (v.description || v.value);
                            if(_test(data.value, v.value)) s = i;
                        }
                        i++; currentNode = currentNode.nextSibling;
                    });
                    while(currentNode) { nx = currentNode.nextSibling; control.ui.removeChild(currentNode); currentNode = nx }
                    control.ui.selectedIndex = s; 
                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                }
	        }
	    }, Component, _base())
	})
    
	define('components/button', ['components/component', 'ui/utils'], function(Component, uiUtils) {
	    return _extend({
	        cname: 'button',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('input'))._dfe_ = control;
                        uiUtils.setAttribute(control.ui, 'type', 'button');
                        uiUtils.addEventListener(control.ui, 'click', function(e){control.component.store(control, control.ui.value);}, true);
                    }
                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                    control.ui.value = data;
                }
	        },
	        appendError: function(control, ui, errs, attrs) {
	            attrs.estyle ? uiUtils.setAttribute(control.ui, 'style', (attrs.style||'') + ';' + (errs && attrs.estyle || '')) : Component.appendError.call(this, control, ui, errs, attrs);
	        }
	    }, Component, _base())    
	})
	
	define('components/container', ['components/dropdown', 'ui/utils'], function(Component, uiUtils) {
	    return _extend({
	        cname: 'container',
	        layout: 'tpos',
	        isContainer: true,
	        runtime: function(control) {
	            return control.runtime || (control.runtime = { fieldData: [], allocs : new Map() }); 
	        },
	        emptyUI: function(control) {
	            Component.emptyUI.call(this, control);
	            var rt = this.runtime(control);
	            rt.allocs = new Map();
	            delete rt.headAlloc;
	            delete rt.footAlloc;
	        },
	        buildFieldData: function(control, previousData, attrs) {
	            var ret = [], match = true, nd, pd, i = 0; 
	            previousData = previousData||[];
	            ret.attrs = attrs;
                (control.field.data.children||[]).forEach(function(cf) {
                    if(!attrs.skip || attrs.skip.indexOf(cf.name) == -1) {
                    	ret.push(nd = { field: cf, clazz: cf['class'] || '', pos: cf.pos });
                        match = match && (pd = previousData[i++]) && nd.clazz == pd.clazz && nd.field == pd.field && nd.pos == pd.pos;
                    }
                })
	            ret.match = match && i == previousData.length;
	            return ret;
	        },
	        allocateNodes: function(control, ui, attrs, fieldData, nextAllocs) {
	            var ret = { nodes: [], rows: [] }, nodes, td, tr, ib = nextAllocs && nextAllocs.rows[0];
	            fieldData.forEach(function(fd) {
                    ret.nodes.push(nodes = []);
                    fd.pos.forEach(function(pos){
                        if(pos.n == 'Y' || !tr) {
                            ui.insertBefore(tr = document.createElement('tr'), ib||null);
                            ret.rows.push(tr);
                        }
                        nodes.push(td = document.createElement(fd.clazz == '' ? 'td' : 'th'));
                        td.setAttribute('valign', fd.clazz == '' ? 'top' : 'middle');
                        tr.appendChild(td);
                        pos.w && td.setAttribute('colSpan', pos.w);
                        pos.h && td.setAttribute('rowSpan', pos.h);
                        pos.s && ( pos.s.charAt(0) == '.' ? td.setAttribute('class', pos.s.substr(1)) : td.setAttribute('style', pos.s) );
                    })
	            }); 
	            return ret; 
	        }, 
	        positionChildren: function(control, allocs, fieldData, rowData) {
	            var children = rowData ? control.children.get(rowData) : control.fixedChildren, rt = this.runtime(control), i = 0;
	            fieldData.forEach(function(fd) {
	                var cc = children.get(fd.field);
	                cc.component.setParentNode(cc, allocs.nodes[i++]);
	            });
	        },
	        render: function(nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if( ! (this.runtime(control).fieldData = this.buildFieldData(control, this.runtime(control).fieldData, attrs)).match ) {
                        this.emptyUI(control);
                    }
                    if(!control.ui) {
                        this.renderFx(nodes, control, data, errs, attrs);
                        this.setEvents(control.ui, control, data, errs, attrs);
                    }
                    this.processRows(control, attrs, data || [], events);
                    this.setAttributes(control, errs, attrs);
                }
	        },
	        setAttributes: function(control, errs, attrs) {
	            Component.setAttributes.call(this, control, errs, attrs);
	            var rt = this.runtime(control), ha = rt.headAlloc, fa = rt.footAlloc, body = rt.allocs;
	            ha && ha.rows.forEach(function(r) { uiUtils.setAttribute(r, 'class', attrs['rowclass$header']); uiUtils.setAttribute(r, 'style', attrs['rowstyle$header']); });
	            fa && fa.rows.forEach(function(r) { uiUtils.setAttribute(r, 'class', attrs['rowclass$footer']); uiUtils.setAttribute(r, 'style', attrs['rowstyle$footer']); });
	            body && body.forEach(function (aa) { aa.rows.forEach(function(r) { uiUtils.setAttribute(r, 'class', attrs.rowclass); uiUtils.setAttribute(r, 'style', attrs.rowstyle); })});
	        },
	        renderFx: function(nodes, control, data, errs, attrs) {
	            nodes[0].appendChild(control.ui = document.createElement('table'))._dfe_ = control;
	            uiUtils.isIE7 && control.ui.appendChild(control.ui_tbody = document.createElement('tbody'));
	            var rt = this.runtime(control), elem;
	            var hf = rt.fieldData.filter(function(fd) { return fd.clazz!='' && fd.clazz!='footer' });
	            var ff = rt.fieldData.filter(function(fd) { return fd.clazz=='footer' });
	            if(hf.length > 0) {
	                control.ui.appendChild(elem = document.createElement('thead'));
	                this.positionChildren(control, this.headAlloc = this.allocateNodes(control, elem, attrs, hf), hf);
	            }
	            if(ff.length > 0) {
	                control.ui.appendChild(elem = document.createElement('tfoot'));
	                this.positionChildren(control, this.footAlloc = this.allocateNodes(control, elem, attrs, ff), ff);
	            }
	        },
	        processRows: function(control, attrs, newRows, events) {
	            var rt = this.runtime(control), newAllocs = new Map(), oldAllocs = rt.allocs, or = [], fieldData = rt.fieldData.filter(function(fd) {return fd.clazz=='';});
	            oldAllocs.forEach(function(v,k){or.push(k)});
	            var nr = this.orderFilter(control, attrs, newRows), nrs = new Set();
                nr.forEach(function(r){nrs.add(r)});
	            for(var i = 0, j = 0; i < nr.length; ) {
                    var _n = nr[i];
	                if(j == or.length) {
	                    newAllocs.set(_n, this.insertRowBefore(control, attrs, _n, fieldData, rt.footAlloc));
                        i++;
	                    continue ;
	                }
                    var _o = or[j], orA = oldAllocs.get(_o);
                    if(typeof orA == 'undefined') {
                        j++; 
                        continue;
                    }
                    if(_n == _o) {
                        newAllocs.set(_n, orA);
                        oldAllocs['delete'](_o);
                        i++, j++;
                        continue ;
                    }
                    var nrA = oldAllocs.get(_n);
                    if(!nrs.has(_o)) {
                    	if(typeof nrA == 'undefined') {
                    		this.replaceRow(control, _n, fieldData, orA, _o);
                    		oldAllocs['delete'](_o);
                    		newAllocs.set(_n, orA);
                    		i++;
                    	}
                        j++;
                        continue;
                    }
                    if(typeof nrA != 'undefined') {
                        this.moveRow(control, nrA, orA);
                        newAllocs.set(_n, nrA);
                        oldAllocs['delete'](_n);
                    } else {
	                    newAllocs.set(_n, this.insertRowBefore(control, attrs, _n, fieldData, orA));
                    }
                    i++;
	            }
                oldAllocs.forEach( function(v, k){ this.removeDataRow(control, v, k) }, this);
	            rt.allocs = newAllocs;
	        },
            moveRow: function(control, nrA, orA) {
                var ib = orA.rows[0], ui = control.ui_tbody||control.ui;
                nrA.rows.forEach(function(r) { ui.insertBefore(r, ib) } )
            },
	        insertRowBefore: function(control, attrs, nd, fieldData, oldAlloc) {
	            var nal = this.allocateNodes(control, control.ui_tbody||control.ui, attrs, fieldData, oldAlloc);
	            this.positionChildren(control, nal, fieldData, nd);
                return nal;
	        },
	        removeDataRow: function(control, oldAlloc, or) {
                var prevChildren = control.children.get(or);
	            prevChildren && prevChildren.forEach(function(c) {c.component.setParentNode(c)});
	            oldAlloc.rows.forEach(function(r) { (control.ui_tbody||control.ui).removeChild(r) } );
	        },
	        replaceRow: function(control, nd, fieldData, oldAlloc, od) {
	            var pc = control.children.get(od), c;
	            pc && fieldData.forEach(function(f) { var c = pc.get(f.field); c.component.setParentNode(c) });
	            this.positionChildren(control, oldAlloc, fieldData, nd);
	        },	        
	        orderFilter: function(control, attrs, newRows) {
	            if(typeof attrs.filter == 'function') {
	                newRows = newRows.filter(attrs.filter);
	            }
	            if(Array.isArray(attrs.filter)) { 
	                var s = new Set(); 
	                attrs.filter.forEach(function(r) { s.add(r.data) });
	                newRows = newRows.filter(function(px) {return s.has(px.data)});
	            }
	            return (typeof attrs.order == 'function' ? newRows.sort(attrs.order) : newRows).map(function(r) { return r.data; });
	        }
	    }, Component, _base())
	})
	
	define('components/div', ['components/component', 'components/container', 'ui/utils'], function(Component, CContainer, uiUtils) {
	    return _extend({
	        cname: 'div',
	        layout: 'dpos',
	        buildFieldData: function(control, previousData, attrs) {
	            var ret = [], nd, dp, i=0, cls, match = true; 
	            ret.attrs = attrs;
	            previousData = previousData||[];
	            (control.field.data.children||[]).forEach(function(cf) {
                    if( !attrs.skip || attrs.skip.indexOf(cf.name) == -1 ) {
                    	nd = { field: cf, clazz: cf['class'] || '', pos: cf.pos };
                        if( cf.name && cf.name == attrs.hfield ) {
	                        pd = previousData.headField;
                            ret.headField = nd;
                        } else {
                            pd = previousData[i++];
                            ret.push(nd);
                        }
                        match = match && pd && nd.clazz == pd.clazz && nd.field == pd.field && nd.pos == pd.pos;
                    }
                });
	            ret.match = match && ret.length == previousData.length;
	            return ret;
	        },
	        setAttributes: Component.setAttributes,
	        allocateNodes: function(control, ui, attrs, fieldData, nextAllocs) {
	            var ret = { nodes: [], rows: [] }, nodes, div, ib = nextAllocs && nextAllocs.rows[0];
	            fieldData.forEach(function(fd) {
                    ret.nodes.push(nodes = []);
                    fd.pos.forEach(function(pos){
                        ui.insertBefore(div = document.createElement('div'), ib||null);
                        ret.rows.push(div);
                        nodes.push(div);
                        pos.colclass && div.setAttribute('class', pos.colclass);
                        pos.colstyle && div.setAttribute('style', pos.colstyle);
                    })
	            }); 
	            return ret;
	        },
	        renderFx: function(nodes, control, data, errs, attrs) {
	            nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
	            var rt = this.runtime(control), hf = rt.fieldData.filter(function(fd) { return fd.clazz!='' });
	            hf.length > 0 && this.positionChildren(control, rt.headAlloc = this.allocateNodes(control, control.ui, attrs, hf), hf);
	        }
	    }, CContainer, _base())
	})  
	
	define('components/form', ['components/div'], function(CDiv) {
	   return _extend({
	        cname: 'form',
	        toAttribute: (function(c){ var r = new Set(); c.forEach(function(a) {r.add(a)}); return r})(['action', 'method', 'target', 'class', 'style', 'id', 'name']),
	        renderFx: function(nodes, control, data, errs, attrs) {
                nodes[0].appendChild(control.ui = document.createElement('form'))._dfe_ = control;
	            var rt = this.runtime(control), hf = rt.fieldData.filter(function(fd) { return fd.clazz!='' });
	            hf.length > 0 && this.positionChildren(control, rt.headAlloc = this.allocateNodes(control, control.ui, attrs, hf), hf);
	        }
	    }, CDiv, _base())
	})
	
	define('components/div-r', ['components/container', 'components/div', 'ui/utils'], function(CContainer, CDiv, uiUtils) {
	   return _extend({
	        cname: 'div-r',
	        setAttributes: CContainer.setAttributes,
	        allocateNodes: function(control, ui, attrs, fieldData, nextAllocs) {
	            var ret = { nodes: [], rows: [] }, nodes, rdiv, div, ib = nextAllocs && nextAllocs.rows[0];
	            ui.insertBefore(rdiv = document.createElement('div'), ib||null);
	            ret.rows.push(rdiv);
	            fieldData.forEach(function(fd) {
                    ret.nodes.push(nodes = []);
                    fd.pos.forEach(function(pos) {
                        rdiv.appendChild(div = document.createElement('div'));
                        nodes.push(div);
                        uiUtils.setAttribute(div, 'class', pos.colclass);
                        uiUtils.setAttribute(div, 'style', pos.colstyle);
                    });
	            }); 
	            return ret;
	        }
	    }, CDiv, _base())
	})
	
	define('components/tab-s', ['components/div-r', 'ui/utils'], function(CDivR, uiUtils) {
	    return _extend({
	        cname: 'tab-s',
	        render: function(nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    var rt = this.runtime(control);
                    attrs.focusnew && events.forEach(function(e) { rt.activeTab = e.action == 'a' ? e.d1 : rt.activeTab });
                    CDivR.render.call(this, nodes, control, data, errs, attrs, events);
                    var headAlloc = this.runtime(control).headAlloc.rows[0], headField = rt.fieldData.headField;
                    while(headAlloc.lastChild) headAlloc.removeChild(headAlloc.lastChild);
                    if(headField) {
                        control.children.forEach(function(fl, modelData){ 
                            var c = fl.get(headField.field), div, span, pnode = [];
                            headField.pos.forEach(function(pos){
                                headAlloc.appendChild(div = document.createElement('div'));
                                pnode.push(div);
                                uiUtils.setAttribute(div, 'class', (pos && pos.colclass||'') + (modelData == rt.activeTab && attrs.haclass ? ' ' + attrs.haclass : ''));
                                uiUtils.setAttribute(div, 'style', pos && pos.colstyle);
                                uiUtils.addEventListener(div, 'click', function(e) {
                                    if(modelData != rt.activeTab) { rt.activeTab = modelData; control.notifications.push({ action : 'self' }); }
                                }, false);
                            })
                            c.component.setParentNode(c, pnode);
                        });
                    }
                }
	        },
	        orderFilter: function(control, attrs, newRows) {
	            var l = control.model.listener, rt = this.runtime(control), nrS = new Set(), has, at = rt.activeTrack; rt.activeTrack = [];
	            newRows.forEach(function(r) { nrS.add(r.data); has |= r.data == rt.activeTab });
	            for(var i = 0; at && i < at.length; i++) nrS.has(at[i]) && rt.activeTrack.push(at[i]);
	            has ? rt.activeTrack.push(rt.activeTab) : rt.activeTab = rt.activeTrack[rt.activeTrack.length - 1] || newRows.length && newRows[0].data;
	            return rt.activeTab ? [rt.activeTab]:[];
	        },
	        renderFx: function(nodes, control, data, errs, attrs) {
                nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
	            this.runtime(control).headAlloc = { rows: [control.ui.appendChild(document.createElement('div'))] };
	        }
	    }, CDivR, _base())
	})
    
    define('components/tab-d', ['components/tab-s', 'ui/utils'], function(CTabS, uiUtils) {
        return _extend({
	        cname: 'tab-d',
            render: function(nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    var ch = control.field.data.children||[], rt = this.runtime(control);
                    attrs.hfield = ch.filter(function(cf) { return (cf.class||0) == 0 }).pop();
                    attrs.hfield && (attrs.hfield = attrs.hfield.name);
                    (data||[]).forEach(function(r) { rt.activeTab && rt.activeTab.hfield == r.data.hfield && (rt.activeTab = r.data) });
                    CTabS.render.call(this, nodes, control, data, errs, attrs, events);
                    control.fixedChildren.forEach(function(cc) { cc.component.setParentNode(cc)})
                    var d = rt.fieldData.filter(function(fd) { return fd.field.name == rt.activeTab.hfield });
                    rt.footAlloc || (rt.footAlloc = this.allocateNodes(control, control.ui, attrs, d));
                    this.positionChildren(control, rt.footAlloc, d);
                }
            },
	        orderFilter: function(control, attrs, newRows) { CTabS.orderFilter.call(this, control, attrs, newRows); return [] },
        }, CTabS, CTabS.base())
    })    
	
	define('components/div-c', ['components/div', 'ui/utils'], function(CDiv, uiUtils) {
	    return _extend({
	        cname: 'div-c',
	        allocateNodes: function(control, ui, attrs, fieldData, nextAllocs) {
	            var ret = { nodes: [], rows: [] }, nodes;
	            for(var columns = this.runtime(control).columns, i = 0, j = 0; i < fieldData.length; i++) {
                    ret.nodes.push(nodes = []);
                    fieldData[i].pos.forEach(function(pos, p){
                        var div = document.createElement('div');
                        uiUtils.setAttribute(div, 'class', pos.colclass);
                        uiUtils.setAttribute(div, 'style', pos.colstyle);
                        columns[j++].insertBefore(div, nextAllocs && nextAllocs.nodes[i][p]||null);
                        ret.rows.push(div);
	                    nodes.push(div);
                    })
	            } 
	            return ret;
	        },
	        renderFx: function(nodes, control, data, errs, attrs) {
                nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
	            var rt = this.runtime(control), fd = rt.fieldData, hf = fd.filter(function(fd) { return fd.clazz!='' }), elem;
	            rt.columns = [];
	            for(var i = 0; i < Math.max(hf.length, fd.length - hf.length); i++) {
	                rt.columns.push(elem = document.createElement('div')); control.ui.appendChild(elem);
	            }
	            hf.length > 0 && this.positionChildren(control, rt.headAlloc = this.allocateNodes(control, control.ui, attrs, hf), hf);
	        },
	        setAttributes: function(control, errs, attrs) {
	            CDiv.setAttributes.call(this, control, errs, attrs);
	            var rt = this.runtime(control);
	            for(var i = 0; i < rt.columns.length; i++) {
	                uiUtils.setAttribute(rt.columns[i], 'class', attrs['rowclass$'+i]||attrs['rowclass$header']);
	                uiUtils.setAttribute(rt.columns[i], 'style', attrs['rowstyle$'+i]||attrs['rowstyle$header']);
	            }
	        },
	        removeDataRow: function(control, oldAlloc, or) {
	            var prevChildren = control.children.get(or);
	            prevChildren && prevChildren.forEach(function(c) {c.component.setParentNode(c)});
	            for(var columns = this.runtime(control).columns, i=0; i < oldAlloc.rows.length; i++)
	                columns[i].removeChild(oldAlloc.rows[i]);
	        },
            moveRow: function(control, nrA, orA) {
                for(var columns = this.runtime(control).columns, i = orA.rows.length-1; i>=0; i--)
	                columns[i].insertBefore(nrA.rows[i], orA.rows[i])
            }
	    }, CDiv, _base())
	})
	
	define('components/checkbox', ['components/component', 'ui/utils'], function(Component, uiUtils) {
	    return _extend({
	        cname: 'checkbox',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                        control.ui.appendChild(control.inputUi = document.createElement('input')); 
                        control.ui.appendChild(control.labelUi = document.createElement('label'));
                        control.inputUi.setAttribute('type', 'checkbox');
                        uiUtils.addEventListener(control.inputUi, 'change', function(e){ control.component.store(control, control.inputUi.checked ? 'Y' : 'N')}, true);
                        this.setEvents(control.inputUi, control, data, errs, attrs);
                    }
                    if(Array.isArray(data)) data = data[0];
                    data || (data='N');
                    control.inputUi.checked =  typeof data == 'object' ? (data.checked != 0 && 'Yy'.indexOf(data.checked) != -1) : ('Yy'.indexOf(data) != -1);
                    control.labelUi.innerText = data.text||'';

                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                }
	        }
	    }, Component, _base())
	})
    
    define('components/pass-through', ['components/component', 'ui/utils'], function(Component, uiUtils) {
        return _extend({
	        cname: 'pass-through',
            isContainer: true,
            slots: 0,
            // TODO: ...
            attachUI: function (control, nodes) {
                control.children.forEach(function(m){ 
                    var i = 0;
                    m.forEach(function(c) { 
                        c.component.setParentNode(c, [nodes[i++]])
                    })
                })
            },
            detachUI: function (control) {
                control.children.forEach(function(m){ 
                    m.forEach(function(c) { 
                        c.component.detachUI(c)
                    })
                })
            },            
	        render: function (nodes, control, data, errs, attrs, events) {
                this.attachUI(control, nodes);
	        }
	    }, Component, {});//function (n, f, c) { return _extend({ name: n, children: c||[], component: _extend({ slots: 1 }, arguments.callee) }, f) })
    })
    
	define('components/radiolist', ['components/component', 'ui/utils'], function(Component, uiUtils) {
	    var incId = 0;
	    return _extend({
	        cname: 'radiolist',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                        uiUtils.addEventListener(control.ui, 'change', function(e){
                            var selected = [], cc = control.ui.children;
                            for(var i = cc.length - 1; i >= 0; i--)
                                if(cc[i].checked) { selected = cc[i].dataValue; break ; }
                            control.component.store(control, selected);
                        }, true);
                        this.setEvents(control.ui, control, data, errs, attrs);
                    }
                    var orientation = attrs.orientation;
                    if( orientation != 'horizontal') orientation = 'vertical';
                    typeof data == 'string' && (data = {value: data});
                    data = (Array.isArray(data) ? data[0] : data) || {};
                    data.value = (Array.isArray(data.value) ? data.value[0] : data.value) || 0;
                    control.radioname || (control.radioname = ++incId);
                    if(!data.items) data.items =  [{value :'Y', description : 'Yes'}, {value :'N', description : 'No'}];
                    var /*innerHTML = '',*/ r;
                    while(control.ui.firstChild) control.ui.removeChild(control.ui.firstChild);
                    if(data.items) {
                        data.items.forEach( function(it) {
                            control.ui.appendChild(r = document.createElement('input')); 
                            r.setAttribute('type', 'radio'); 
                            r.setAttribute('name', control.radioname); 
                            r.dataValue = it.value; 
                            _test(data.value, it.value) && /*reset = false;*/ r.setAttribute('checked', 'checked');
                            control.ui.appendChild(r = document.createElement('label'));
                            r.innerText = it.description || it.value; 
                            orientation == 'vertical' && control.ui.appendChild(document.createElement('br'));
                        });
                    }
                    //control.ui.innerHTML = innerHTML;
                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                }
	        }
	    }, Component, _base())
	})
	 
	define('components/label', ['components/component', 'ui/utils'], function(Component, uiUtils) {
	    return _extend({
	        cname: 'label',
	        render: function (nodes, control, data, errs, attrs, events) {    
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('label'))._dfe_ = control;
                        //uiUtils.addEventListener(control.ui, 'click', function(e){control.component.store(control, 'clicked')});
                        this.setEvents(control.ui, control, data, errs, attrs);
                    }
                    attrs.html ? (control.ui.innerHTML = data) : (control.ui.innerText = data);
                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                }
	        }
	    }, Component, _base())
	})
	
	define('components/html', ['components/component', 'ui/utils'], function(Component, uiUtils) {
	    return _extend({
	        cname: 'html',
	        render: function (nodes, control, data, errs, attrs, events) {
	        	if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(attrs.nowrap && data instanceof Element ) {
                        control.ui && nodes[0].removeChild(control.ui);
                        nodes[0].appendChild(control.ui = data);
                        this.setEvents(control.ui, control, data, errs, attrs);
                        this.setAttributes(control, errs, attrs);
                    } else {
                        if(!control.ui) {
                            nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                            this.setEvents(control.ui, control, data, errs, attrs);
                        }
                        if(typeof data == 'string') {
                            control.ui.innerHTML = data;
                        } else {
                            while(control.ui.firstChild) control.ui.removeChild(control.ui.firstChild);
                            (Array.isArray(data) ? data : [data]).forEach( function(node) { control.ui.appendChild(node) }  )
                        }
                        this.setAttributes(control, errs, attrs);
                        this.appendError(control, nodes[0], errs, attrs);
                    }
	        	}
            }
        }, Component, _base())
    })
	
	define('components/textarea', ['components/editbox', 'ui/utils'], function(CEditbox, uiUtils) {
	    return _extend({
	        cname: 'textarea',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('textarea'))._dfe_ = control;
                        function store() { delete control.inputLock; control.component.store(control, control.ui.value);  }
                        uiUtils.addEventListener(control.ui, 'keydown', function() { control.inputLock = true; })
                        uiUtils.addEventListener(control.ui, attrs.trigger||'keyup', store );
                        attrs.trigger == 'change' || uiUtils.addEventListener(control.ui, 'change', store);
                        this.setEvents(control.ui, control, data, errs, attrs);
                    }
                    if(control.ui.value != data && !control.inputLock) control.ui.value = data;
                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                }
	        }
	    }, CEditbox, _base())
	})
    
	define('components/editbox-P', ['components/editbox', 'ui/utils'], function(CEditbox, uiUtils) {
	    return _extend({
	        cname: 'editbox-P',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    var rt = this.runtime(control), self = this;
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('input'))._dfe_ = control;
                        uiUtils.addEventListener(control.ui, 'focus', function(e) { self.showPopup(control) });
                        uiUtils.addEventListener(control.ui, 'click', function(e) { self.showPopup(control) });
                        uiUtils.addEventListener(control.ui, attrs.trigger || 'keyup', function(e) { control.currentValue === control.ui.value || control.component.store(control, control.ui.value) });
                        uiUtils.addEventListener(control.ui, 'keydown', function(e) { 
                            (e.key == 'Esc' || e.key == 'Escape') && rt.ta && control.closePopup();
                            e.key == 'Enter' && (e.preventDefault(), self.showPopup(control), self.getPopupActiveElement(control).focus());
                            e.key == 'Tab' && rt.ta && (self.getPopupActiveElement(control).focus(), e.preventDefault());
                        });
                    }
                    this.setValue(control, data, errs, attrs);
                    this.setAttributes(control, errs, attrs);
                    this.appendError(control, nodes[0], errs, attrs);
                    this.setPopupAttributes(control, attrs.ta||{}, errs);
                    this.updatePopupContent(control, data, attrs);
                }
	        },
	        setValue: function(control, data, errs, attrs) {
	            control.ui.value === data || (control.ui.value = data);
	            control.currentValue = control.ui.value;
	        },
	        updatePopupContent: function(control, data, attrs) {
	            var rt = this.runtime(control);
	            rt.ta && rt.popup && !rt.ta.contains(control.ui.ownerDocument.activeElement) && (rt.popup.value == data || (rt.popup.value = data, rt.popup.selectionStart = rt.popup.selectionEnd = 0, rt.popup.scrollTop = 0));
	        },
	        getPopupUi: function(control) {
	            var attrs = control.model.attrs, rt = this.runtime(control), p = rt.popup;
	            if(!rt.popup) { 
	                rt.popup = p = control.ui.ownerDocument.createElement('textarea');
	                uiUtils.setAttribute(p, 'class', 'edit-popup-textarea');
	                uiUtils.addEventListener(p, attrs.trigger || 'keyup', function(){ 
	                    control.component.store(control, control.ui.value = p.value);
	                    control.currentValue = p.value;
	                });
	                uiUtils.addEventListener(p, 'keydown', function(e) { 
	                    (e.key == 'Esc' || e.key == 'Escape') && (control.ui.focus(), control.closePopup()) 
	                    e.key == 'Tab' && (control.ui.focus(), e.preventDefault()); // ??
	                });
	            }
	            return p;
	        },
	        onResize: function(control) {},
	        getPopupActiveElement: function(control) { 
	            return this.runtime(control).popup 
	        },
	        onClosePopup: function(control) {},
	        purge: function (control) { control.closePopup && rt.ta && control.closePopup(); this.emptyUI(control); },
	        showPopup: function(control) {
	            var rt = this.runtime(control), scrollFollow, escUnf, doc = control.ui.ownerDocument, self = this;
	            if(control.ui && !rt.ta) {
	                this.createPopup(control);
	                this.updatePopupContent(control, control.data, control.model.attrs);
	                (scrollFollow = function() {
	                    var r = control.ui.getBoundingClientRect(), op = control.ui.offsetParent, wnd = doc.defaultView||window;
	                    rt.ta.style.display = (op.scrollTop > control.ui.offsetTop + control.ui.offsetHeight || op.scrollTop + op.clientHeight < control.ui.offsetTop + control.ui.offsetHeight) ? 'none' : '';
	                    rt.ta.style.top = (r.bottom + 2 + (wnd.scrollY||wnd.pageYOffset) + (rt.ta_t||0)) + 'px';
	                    rt.ta.style.left = (r.left + (wnd.scrollX||wnd.pageXOffset) + (rt.ta_l||0)) + 'px';
	                })();
	                for(var e = control.ui; e; e = e.parentElement) e.addEventListener('scroll', scrollFollow);
	                var i = setInterval(function() {
	                    doc.activeElement != control.ui && !rt.resizeOngoing && ! rt.ta.contains(doc.activeElement) && control.closePopup();
	                }, 30);
	                control.closePopup = function() {
	                    for(var e = control.ui; e; e = e.parentElement) uiUtils.removeEventListener(e, 'scroll', scrollFollow);
	                    uiUtils.removeEventListener(self.getPopupActiveElement(control), 'keydown', escUnf);
	                    clearInterval(i);
	                    self.onClosePopup(control);
	                    uiUtils.removeNode(rt.ta);
	                    delete rt.ta;
	                }
	                uiUtils.addEventListener(self.getPopupActiveElement(control), 'keydown', (escUnf = function(e) { 
	                    e.key == 'Escape' && !e.defaultPrevented && (control.ui.focus(), control.closePopup());
	                }));
	            }    
	        },
	        createPopup: function(control) {
	            var rt = this.runtime(control), doc = control.ui.ownerDocument, attrs = control.model.attrs, handle, self = this;
	            rt.ta = doc.createElement('div'); 
	            rt.ta.appendChild(this.getPopupUi(control));
	            rt.ta.appendChild(handle = document.createElement('span'));
	            doc.getElementsByTagName('body')[0].appendChild(rt.ta);
	            this.setPopupAttributes(control, attrs.ta||{}, control.error);
	            handle.setAttribute('class', 'ui-resizeable-handle-br');
	            handle.addEventListener('mousedown', function(ie) {
	                rt.resizeOngoing = 1;
	                var ox = ie.screenX, oy = ie.screenY, w = rt.ta.offsetWidth, h = rt.ta.offsetHeight, move, up;
	                document.addEventListener('mousemove', move = function(me) {
	                    self.onResize(control);
	                    rt.ta.style.width = rt.ta_w = (w + me.screenX - ox) + 'px';
	                    rt.ta.style.height = rt.ta_h = (h + me.screenY - oy) + 'px';
	                    me.preventDefault(), window.getSelection().removeAllRanges();
	                });
	                document.addEventListener('mouseup', up = function(me) {
	                    rt.resizeOngoing = 0;
	                    uiUtils.removeEventListener(document, 'mousemove', move);
	                    uiUtils.removeEventListener(document, 'mouseup', up);
	                    self.getPopupActiveElement(control).focus();
	                });
	            });
	        },
	        setPopupAttributes: function(control, attrs, errs) {
	            var rt = this.runtime(control);
	            if(rt.ta) {
	                var st = rt.ta.style, w = st.width||rt.ta_w, h = st.height||rt.ta_h, t = st.top, l = st.left;
	                rt.ta_l = attrs.offsetLeft, rt.ta_t = attrs.offsetTop; 
	                attrs['class'] = (attrs['class']||'') + (errs && attrs.eclass ? ' ' + attrs.eclass : '');
	                this.setAttributesUI(rt.ta, errs, attrs);
	                w && (st.width = w), h && (st.height = h), t && (st.top = t), l && (st.left = l);
	            }
	        }
	    }, CEditbox, _base())
	})
	
	define('components/div-button', ['components/component', 'ui/utils'], function(Component, uiUtils) {
	    return _extend({
	        cname: 'div-button',
	        render: function (nodes, control, data, errs, attrs, events) {
	        	if(!defer(nodes, control, data, errs, attrs, events)) {
		            if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
		                control.ui.appendChild(control.ui_text = document.createElement('label'));
		                control.ui.appendChild(control.ui_error = document.createElement('label'));
		                control.ui_text.setAttribute('class', 'div-button-text');
		                control.ui_error.setAttribute('class', attrs.eclass || 'div-button-error'); 
		                uiUtils.addEventListener(control.ui, 'click', function(e){control.component.store(control, data)});
		                this.setEvents(control.ui, control, data, errs, attrs);
		            }
		            var e = errs ? 'error' : '';
		            if(control.ui_text.innerHTML != data) control.ui_text.innerHTML = data;
		            if(control.ui_error.innerHTML != e) control.ui_error.innerHTML = e;
		            this.setAttributes(control, errs, attrs);
	        	}
	        }
	    }, Component, _base())
	})
	
	define('components/multioption', ['components/component', 'ui/utils'], function(Component, uiUtils) {
	    return _extend({
	        cname: 'multioption',
	        render: function (nodes, control, data, errs, attrs, events) {
	            data.value = Array.isArray(data.value) ? data.value[0] : data.value;
	            control.ui && this.emptyUI(control);
	            if( data && Array.isArray(data.options) ) {
	                (control.ui = document.createElement('div'))._dfe_ = control;
	                this.setAttributes(control, errs, attrs);
	                this.setEvents(control.ui, control, data, errs, attrs);
	                var select = new Set(), d, c, cc = [];
	                (typeof data.value == 'string' ? data.value.split(';') : []).forEach(function(a) { select.add(a) });
	                data.options.forEach(function (o) {
	                    control.ui.appendChild(d = document.createElement('div'));
	                    attrs.rowclass && d.setAttribute('class', attrs.rowclass);
	                    attrs.rowstyle && d.setAttribute('style', attrs.rowstyle);
	                    c = document.createElement('input');
	                    c.setAttribute('type', 'checkbox');
	                    d.appendChild(c);
	                    cc.push(c);
	                    c.checked = select.has(c.value = o.value||o);
	                    uiUtils.addEventListener(c, 'change', function(e){
	                        control.component.store(control, cc.map(function(c) {return c.checked ? c.value : -1}).filter(function(v) {return v != -1}).join(';'));
	                    }, true);
	                    d.appendChild(c = document.createElement('label'));
	                    c.setAttribute('style', 'align-self: center;');
	                    c.innerText = (o.description || o.value || o);
	                }, this);
	                nodes && nodes[0].appendChild(control.ui);
	            }
	        }
	    }, Component, _base())
	})
	
	define('components/div-button-x', ['components/div-button', 'ui/utils'], function(CDivButton, uiUtils) {
	    return _extend({ 
	        cname: 'div-button-x',
	        render: function (nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    CDivButton.render.call(this, nodes, control, data, errs, attrs, events);
                    control.ui.style.position = 'relative';
                    if(!control.ui_x) {
                        control.ui_x = document.createElement('input')
                        control.ui_x.value = 'x';
                        control.ui_x.setAttribute('type', 'button');
                        control.ui_x.setAttribute('class', 'div-button-x');
                        control.ui.appendChild(control.ui_x);
                        uiUtils.addEventListener(control.ui_x, 'click', function(e){ e.stopImmediatePropagation(); control.component.store(control, 'x') }, true);
                        this.setEvents(control.ui, control, data, errs, attrs);        
                    }
                    control.ui_x.style.visibility = (attrs.ta && !attrs.ta.visible) ? 'hidden' : 'visible';
                }
	        }
	    }, CDivButton, _base())
	})

    define('components/switch', ['components/component', 'ui/utils'], function(Component, uiUtils) {
        return _extend({
            cname: 'switch',
            render: function(nodes, control, data, errs, attrs, events) {
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    var rt = this.runtime(control);
                    attrs.component != rt.renderingComponent && rt.renderingComponent && rt.renderingComponent.purge(control);
                    (rt.renderingComponent = attrs.component).render(nodes, control, data, errs, attrs, events);
                }
            }
        }, Component, _base());
    })
        
    define('components/dfe-runtime', ['components/component', 'dfe-core', 'ui/utils'], function(Component, core, uiUtils) {
        var map = new Map();
        function load(f, p, c, d, e, a, t) { 
            var fform = map.get(f);
            fform||map.set(f, fform=require(['forms/'+f], function(form){ return fform.formComponent = form }));
            var k = c._deferred = fform.formComponent && p ? 0 : function(p) {c.component.render(p, c, d, e, a, t)} 
            if(!fform.formComponent) {
                fform.then(function(){
                    c._deferred == k && c._deferred(p);
                })
            }
            return fform.formComponent;
        }
        return _extend({
	        purge: function (control) { 
                var rt = this.runtime(control);
                rt.runtime && rt.runtime.shutdown();
	            Component.purge.call(this,control); 
	        },
            cname: 'dfe-runtime',
            render: function(nodes, control, data, errs, attrs, events) {
                var form = load(attrs.form, nodes, control, data, errs, attrs, events), rt = this.runtime(control);
                if(nodes && form) {
                    form = form.form;
                    if(!control.ui) {
                        nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                        rt.childNodes = [];
                        form.dfe.forEach(function(dfe){
                            for(var i = 0; i < dfe.component.slots; i++)
                                rt.childNodes.push(control.ui.appendChild(document.createElement('div')));
                        })
                    }
                    this.setAttributes(control, errs, attrs);
                    rt.runtime && rt.runtime.shutdown();
                    control.ui._dfe_runtime = rt.runtime = core.startRuntime({form: form, model: data, node: rt.childNodes});
                    rt.runtime.parentRuntimeControl = control;
                }
            }
        }, Component, _base());
    })
    
    define('components/labeled-component', ['components/component', 'ui/utils'], function(Component, uiUtils) {
        return _extend({
	        cname: 'labeled-component',
            slots: 2,
            renderingComponent: null,
            attachUI: function (control, nodes) {
                this.renderingComponent.attachUI(control, nodes.slice(1));
                control.captionUi && nodes[0].appendChild(control.captionUi); 
	            control.captureError && control.errorUi && nodes[0].appendChild(control.errorUi);
            },
            detachUI: function (control) {
                this.renderingComponent.detachUI(control);
                uiUtils.removeNode(control.captionUi);
            },
            emptyUI: function (control) {
                this.renderingComponent.emptyUI(control);
                uiUtils.removeNode(control.captionUi);
                delete control.captionUi; 
	        },
	        purge: function (control) {
	        	this.renderingComponent.purge(control);
	        	uiUtils.removeNode(control.captionUi);
                delete control.captionUi; 
	        },
            render: function(nodes, control, data, errs, attrs, events) { 
                if(!defer(nodes, control, data, errs, attrs, events)) {
                    if(!control.captionUi) {
                        nodes[0].appendChild(control.captionUi = document.createElement('label'))._dfe_ = control;
                    }
                    attrs.html ? (control.captionUi.innerHTML = attrs.html) : (control.captionUi.innerText = attrs.text);
                    uiUtils.setAttribute(control.captionUi, 'style', attrs.cstyle);
                    var ce = attrs.captureError || this.captureError;
                    if(control.captureError = typeof ce != 'function' || ce(data, errs, attrs)) {
                    	this.renderingComponent.render(nodes.slice(1), control, data, 0, attrs, events);
                    	this.appendError(control, nodes[0], errs, attrs);
                    } else {
                    	this.renderingComponent.render(nodes.slice(1), control, data, errs, attrs, events);
                    }
                }
            }
        }, Component, _base());
    })
    
    define('components/c-checkbox', ['components/labeled-component', 'components/checkbox', 'ui/utils'], function(DWC, Checkbox, uiUtils) {
        return _extend({
	        cname: 'c-checkbox',
            renderingComponent: Checkbox,
        }, DWC, _base())
    })    
	
    define('components/c-dropdown', ['components/labeled-component', 'components/dropdown', 'ui/utils'], function(DWC, Dropdown, uiUtils) { 	
        return _extend({
	        cname: 'c-dropdown',
            renderingComponent: Dropdown,
        }, DWC, _base())
    })
	
    define('components/c-editbox', ['components/labeled-component', 'components/editbox', 'ui/utils'], function(DWC, Editbox, uiUtils) {
        return _extend({
	        cname: 'c-editbox',
            captureError: function(data, errs, attrs) { return !attrs.eclass },
            renderingComponent: Editbox,
        }, DWC, _base())
    })  
    
    define('components/c-editbox-$', ['components/labeled-component', 'components/editbox-$', 'ui/utils'], function(DWC, Editbox$, uiUtils) {
        return _extend({
	        cname: 'c-editbox-$',
            renderingComponent: Editbox$,
        }, DWC, _base())
    })     
	
    define('components/c-radiolist', ['components/labeled-component', 'components/radiolist', 'ui/utils'], function(DWC, Radiolist, uiUtils) {
        return _extend({
	        cname: 'c-radiolist',
            renderingComponent: Radiolist,
        }, DWC, _base())
    })
})()
