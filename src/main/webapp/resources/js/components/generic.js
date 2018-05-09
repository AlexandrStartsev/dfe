define('components/base', ['dfe-core'], function(Core) {
    return class BaseComponent extends Core.Component {
        render(data, error, attributes, children) {
            return data.toString();
        }
        renderDefault() {
            return [undefined]
        }
    }
})

define('components/container', ['dfe-core'], function(Core) {
    return class Container extends Core.Component {}
})    

define('components/either', ['dfe-core'], function(Core) {
    return class Either extends Core.Component {
        render(data, error, attributes, children) {
            let first, rest = [];
            children.forEach( map => map.forEach( child => first ? attributes.first || rest.push(child) : (first = child) ) );
            return attributes.first ? first : rest;
        }
    }
})

define('components/text', ['components/base'], function(BaseComponent) {
    return class Text extends BaseComponent {}
}) 

define('components/span', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class Span extends BaseComponent {         
        render(data, error, attributes, children) {
            let sub = [];
            children.forEach( 
                (map, row) => map.forEach( 
                    child => sub.push( Core.createElement('span', {key: row ? row.key : 0}, child) ) 
                )
            )
            return Core.createElement('span', {class: attributes.class, style: attributes.style}, sub);
        }
    }
})

define('components/div', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class Span extends BaseComponent {         
        render(data, error, attributes, children) {
            let sub = [];
            children.forEach( 
                (map, row) => map.forEach( 
                    child => sub.push( Core.createElement('div', {key: row ? row.key : 0}, child) ) 
                )
            )
            return Core.createElement('div', {class: attributes.class, style: attributes.style}, sub);
        }
    }
})

define('components/table', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class Table extends BaseComponent {
        render(data, error, attributes, children) {
            let rows = this.makeRows(data, attributes, children, 'tr', clazz => clazz === 'header' ? 'th' : 'td' );
            return Core.createElement('table', {class: attributes.class, style: attributes.style}, [
                rows.$header.length && Core.createElement('thead', {}, rows.$header),
                rows[""].length && Core.createElement('tbody', {}, rows[""]),
                rows.$footer.length && Core.createElement('tfoot', {}, rows.$footer)
            ]);
        }
        makeRows(data, attributes, children, rowElement, classToCellElement) {
            let rows = { $header: [], $footer: [], "": [] }, lastRow = -1;
            let orderedFilteredColumns = this.orderFilterColumns(attributes);
            let orderedFilteredRows = this.orderFilterRows(attributes, data).map(row => row.data);
            children.get(null) && orderedFilteredRows.push(null);
            orderedFilteredRows.forEach(
                row => {
                    let fieldMap = children.get(row);
                    orderedFilteredColumns.forEach(
                        field => {
                            let child = fieldMap.get(field);
                            let selector = field.class ? '$' + field.class : '';
                            let currentBlock = rows[selector];
                            if( currentBlock ) {
                                let currentRow = currentBlock[ currentBlock.length - 1 ];
                                let ii = child.immediateNodeInfo[0];
                                if(!currentRow || lastRow !== row || ii && ii.newRow && currentRow.children.length ) {
                                    currentBlock.push( currentRow = Core.createElement(rowElement, {
                                        key: row ? row.key : 0,
                                        class: attributes['rowclass' + selector],
                                        style: attributes['rowstyle' + selector],
                                    }));
                                    lastRow = row;
                                }
                                currentRow.children.push( Core.createElement( classToCellElement(field.class), child ) )
                            }
                        }
                    )
                }
            )
            return rows;
        }
        orderFilterColumns(attributes) {
            let field = this.$node.field, form = this.$node.form, model = this.$node.model;
            let children = attributes.skip ? field.children.filter( field => typeof attributes.skip === 'function' ? !attributes.skip.call(form, field.name, model) : attributes.skip.indexOf(field.name) === -1 ) : field.children;
            return typeof attributes.colOrder === 'function' ? children.sort((c1, c2) => attributes.colOrder.call(form, c1.name, c2.name, model) ) : children;
        }
        orderFilterRows(attributes, allRows) {
            if(typeof attributes.filter == 'function') {
                allRows = allRows.filter(attrs.filter);
            }
            return (typeof attributes.order == 'function' ? allRows.sort(attributes.order) : allRows);
        }
    }
})

define('components/labeled-component', ['components/base'], function(BaseComponent) {
    return class Labeled extends BaseComponent {
        render(data, error, attributes, children) {
            let firstChild;
            children.forEach(( m, _ ) => m.forEach(( child, _ ) => firstChild || (firstChild = child) ));
            return [ attributes.text, firstChild ]
        }
        renderDefault() {
            return [ undefined, undefined ]
        }
    };
})

define('components/validation-component', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class ValidationComponent extends BaseComponent {
        doValidation(events, attrs) {
            let vs = (attrs.vstrategy||'').split(' ');
            if( vs.indexOf('none') != -1 ) {
                return false;
            }
            if( vs.indexOf('disabled') == -1 && attrs.disabled || attrs.hidden ) {
                return false;
            }
            if( vs.indexOf('always') != -1 ) {
                return true;
            }
            if( ( vs.indexOf('notified') != -1 || vs.indexOf('followup') != -1 && this.stickyError )
                       && (this.error || events.length > 1 || events.length && events[0].action != 'init') ) {
                return true;
            }
            return this.error || events.filter(e => 'validate' === e.action) != 0; 
        }
        render(data, error, attributes, children) {
            return [[Core.createElement('label', {...attributes, text: data.toString()}), 
                     error && Core.createElement('label', {class: 'dfe-error', text: error.toString()}) ]]
        }
    }
})

define('components/editbox', ['dfe-core', 'components/validation-component', 'components/date-picker-polyfill'], function(Core, ValidationComponent) {
    function Patterning (v, p) { 
        while(p && v != 0 && !(v.match(p) && v.match(p)[0] == v) ) {
            v = v.substr(0, v.length-1); 
        }
        return v;
    }
    function Formatting (value, format) { // aka XXX-XXX-XXXX or MM/DD/YYYY
        if(format && typeof value !== 'undefined') {
            let ret = '', i, j, vn, vl, fn, fl;
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
    return class Editbox extends ValidationComponent {
        constructor(node) {
            super(node);
            this.ca = 0;
        }
        onKeyUp(e, doStore) {
            doStore = doStore || this.trigger !== 'store';
            let data = Patterning(Formatting(e.target.value, this.format), this.pattern); 
            delete this.inputLock;
            let transform = typeof this.transform === 'string' && this.transform.split('').map(s => +s);
            if(transform) {
                let t = []; 
                for(let i=0; i < transform.length; i++)
                    data.length > transform[i] && (t[i] = data.charAt(transform[i]));
                for(let i=0; i < t.length; i++) 
                    t[i] = t[i]||' ';
                data = t.join('');
            }
            this.getValueProcessed(data, e.target);
            doStore && this.store(data);
        }
        onKeyDown(e) {
            this.inputLock = true;
            let ui = e.target, s = ui.selectionStart, v = ui.value; 
            if((e.key == 'Backspace' || e.key == 'Delete' || e.key == 'Del') && this.format && v.length != ui.selectionEnd) {
                e.preventDefault();
                s && (ui.selectionEnd = --ui.selectionStart);  
            } 
            if(!e.key || e.key.length > 1 || e.ctrlKey) 
                return ;
            if(this.format) {
                this.ca++;
                if(e.key == this.format[s]) { ui.selectionStart++; e.preventDefault(); return ; }
                while(this.format[s] && '_XdDmMyY9'.indexOf(this.format[s])==-1) s++;
                let ol = v.length, nl = Formatting(v.substr(0, s) + e.key + v.substr(s + 1), this.format).length;
                if(s < ol && nl >= ol || s >= ol && nl > ol ) {
                    ui.value = ui.value.substr(0, s) + ui.value.substr(s + 1); 
                    ui.selectionEnd = s; 
                } else {
                    e.preventDefault();
                    return ;
                }
            }
            if(this.pattern) {
                m = (v = ui.value.substr(0, s) + e.key + ui.value.substr(ui.selectionEnd)).match(this.pattern);
                (!m || m[0] != v) && (this.ca--, e.preventDefault());
            }
        }
        getValueProcessed(data, ui) {
            let transform = typeof this.transform === 'string' && this.transform.split('').map(s => +s);
            if(transform) {
                let t = []; 
                for(let i=0;i<data.length; i++) 
                    transform.length > i && (t[transform[i]] = data.charAt(i));
                data = t.join('');
            }
            data = Patterning(Formatting(data, this.format), this.pattern);
            if(ui && data != ui.value && !this.inputLock) {
                if(document.activeElement === ui) {
                    var v = ui.value, ss = ui.selectionStart;
                    ui.value = data;
                    if(this.format && ss >= this.ca && ss <= v.length && v != ui.value) {
                       var over = this.format.substr(ss-this.ca, this.ca).replace(/[_XdDmMyY9]/g,'').length;
                       ui.selectionEnd = ui.selectionStart = ss + over; 
                    }
                } else {
                    ui.value = data;
                }
                this.ca = 0;
            }
            return data;
        }
        render(data, error, attributes, children) {
            this.format = attributes.formatting;
            this.pattern = attributes.pattern;
            this.transform = attributes.transform;
            this.trigger = attributes.trigger;
            return [[
                Core.createElement('input', {
                    ...attributes, 
                    value: this.getValueProcessed(data.toString()),
                    onKeyDown: e => this.onKeyDown(e),
                    onKeyUp: e => this.onKeyUp(e),
                    onChange: e => this.onKeyUp(e, true)
                }, []),
                error && Core.createElement('label', {class: 'dfe-error', text: error.toString()}) 
            ]]
        }
    }
})

define('components/editbox-$', ['components/editbox'], function(Editbox) {
    function Formatting(v, n, l) {
        do {
            v = (n?'':'$') + v.replace(/[^\d]/g,'').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        } while(l && v.length > l && (v=v.substr(0, v.length-1)));
        return v;
    }

    return class EditboxMoney extends Editbox {
        onKeyUp(e, store) {
            delete this.inputLock;
            let ui = e.target, data = this.getValueProcessed(ui.value, ui);
            store && this.store(data);
        }
        onKeyDown(e) {
            this.inputLock = true;
            let ui = e.target, ml = (this.format && this.format.length) < Formatting(ui.value + '1', this.format && this.format.charAt(0) != '$', 99).length;
            if((e.key == ',' || e.key == 'Delete' || e.key == 'Del') && ui.value.charAt(ui.selectionStart) == ',') ui.selectionStart++;
            if((e.key == 'Delete' || e.key == 'Del') && ui.value.charAt(ui.selectionStart) == '$') ui.selectionStart++;
            !e.ctrlKey && e.key && e.key.length == 1 && ui.selectionStart == ui.selectionEnd && (e.key < '0' || e.key > '9' || ml) && e.preventDefault();
        }
        getValueProcessed(data, ui) {
            Array.isArray(data) && (data=data[0]);
            data = (typeof data == 'string' || typeof data == 'number') ? Formatting(data, this.format && this.format.charAt(0) != '$', this.format && this.format.length) : '';
            if(data === '$') data = '';
            if(ui && data != ui.value && !this.inputLock) {
                let ss = ui.selectionStart, ov = ui.value, o = 0;
                ui.value = data;
                if(document.activeElement == ui) {
                    for(let i=0;i<ss;i++) {
                        (data.charAt(i) == ',' || data.charAt(i) == '$') && o++;
                        (ov.charAt(i) == ',' || ov.charAt(i) == '$') && o--;
                    }
                    ui.selectionStart = ui.selectionEnd = ss + o - (ov.charAt(ss) == ',' && data.charAt(ss + o - 1) == ',' ? 1 : 0);
                }
            }
            return data;
        }
        render(data, error, attributes, children) {
            return super.render(data, error, attributes, children);
        }
    }
})

define('components/button', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    return class Button extends ValidationComponent {
        render(data, error, attributes, children) {
            let value = data.toString();
            return [[
                Core.createElement('input', { ...attributes, value: value, type: 'button', onClick: () => this.store(value, 'click') }),
                error && Core.createElement('label', {class: 'dfe-error', text: error.toString()})
            ]]
        }
    }   
})

define('components/checkbox', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    return class Checkbox extends ValidationComponent {
        render(data, error, attributes, children) {
            if( Array.isArray(data) ) {
                data = data[0];
            }
            let checked = data && (typeof data === 'object' ? data.checked && data.checked.toString().match(/Y|y/) : data.toString().match(/Y|y/));
            let text = typeof data === 'object' && data.text;
            return [[
                Core.createElement('input', { ...attributes, checked: !!checked, type: 'checkbox', onChange: e => this.store(e.target.checked ? 'Y' : 'N') }),
                text,
                error && Core.createElement('label', {class: 'dfe-error', text: error.toString()})
            ]]
        }
    }
})

define('components/dropdown', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    function testChoice(a, b) {
        return a == b || Object.getOwnPropertyNames(a).every(i => a[i] == b[i]);
    }
    return class Dropdown extends ValidationComponent {
        render(data, error, attributes, children) {
            let options = attributes.default ? [{text: 'Please select...', value: attributes.default}] : [];
            let selectedIndex = 0;
            if(Array.isArray(data.items)) {
                options = options.concat( data.items.map( 
                    item => typeof item === 'object' ? { text: item.description || item.value.toString(), value: item.value } : { text: item.toString(), value: item } 
                ) );
            }
            options.forEach( (item, i) => testChoice(data.value, item.value) && (selectedIndex = i) );
            return [[
                Core.createElement(
                    'select', 
                    { ...attributes, selectedIndex: selectedIndex, onChange: e => this.store(options[e.target.selectedIndex].value) },
                    options.map( opt => Core.createElement('option', { text: opt.text }) )
                ),
                error && Core.createElement('label', {class: 'dfe-error', text: error.toString()})
            ]]
        }
        renderDefault() {
            return Core.createElement('select');
        }
    }
})

/*

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
                var rt = this.runtime(control), _this = this;
                attrs.focusnew && events.forEach(function(e) {  rt.activeTab = e.action == 'a' ? e.d1 : rt.activeTab });
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
                                if(modelData != rt.activeTab) {
                                    _this.activeTabChange(control, attrs, modelData);
                                    rt.activeTab = modelData; 
                                    control.notifications.push({ action : 'self' }); 
                                }
                            }, false);
                        })
                        c.component.setParentNode(c, pnode);
                    });
                }
            }
        },
        activeTabChange: function(control, attrs, modelData) {},
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
                var ch = this.orderFilterColumns(control, attrs), rt = this.runtime(control), _a = typeof attrs.activeTab == 'function' ? attrs.activeTab() : rt.activeTab ? rt.activeTab.hfield : '';
                attrs.hfield = ch.filter(function(cf) { return (cf.class||0) == 0 }).pop();
                attrs.hfield && (attrs.hfield = attrs.hfield.name);
                (data||[]).forEach(function(r) { _a == r.data.hfield && (rt.activeTab = r.data) });
                CTabS.render.call(this, nodes, control, data, errs, attrs, events);
                control.fixedChildren.forEach(function(cc) { cc.component.setParentNode(cc)})
                var d = rt.fieldData.filter(function(fd) { return fd.field.name == rt.activeTab.hfield });
                rt.footAlloc || (rt.footAlloc = this.allocateNodes(control, control.ui, attrs, d));
                this.positionChildren(control, rt.footAlloc, d);
                this.setAttributes(control, errs, attrs);
            }
        },
        activeTabChange: function(control, attrs, modelData) {
             typeof attrs.activeTab == 'function' && attrs.activeTab(modelData.hfield);
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

define('components/radiolist', ['components/component', 'ui/utils'], function(Component, uiUtils) {
    var incId = 0;
    return _extend({
        cname: 'radiolist',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('span'))._dfe_ = control;
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
                var r;
                while(control.ui.firstChild) control.ui.removeChild(control.ui.firstChild);
                if(data.items) {
                    data.items.forEach( function(it) {
                        control.ui.appendChild(r = document.createElement('input')); 
                        r.setAttribute('type', 'radio'); 
                        r.setAttribute('name', control.radioname); 
                        r.dataValue = it.value; 
                        _test(data.value, it.value) &&  r.setAttribute('checked', 'checked');
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
                    uiUtils.addEventListener(control.ui, 'click', function(e){control.component.store(control, undefined, 'click')});
                    this.setEvents(control.ui, control, data, errs, attrs);
                }
                attrs.html ? (control.ui.innerHTML = data) : (control.ui.innerText = data);
                this.setAttributes(control, errs, attrs);
                this.appendError(control, nodes[0], errs, attrs);
            }
        }
    }, Component, _base())
})

define('components/label-i', ['components/component', 'ui/utils'], function(Component, uiUtils) {
    return _extend({
        setEvents: function(ui, control, data, errs, attrs) {
            for(var n in attrs.events) 
                (function(a, e) { 
                    if(typeof e == 'function') {
                        var nm = a, t = ui, id, i=a.indexOf('$'), ev, m = control._events || (control._events = new Map()), p; 
                        uiUtils.addEventListener(t, nm, ev = function(event) { 
                            return e.call(control.model.runtime.form, event, control) 
                        }, false);
                        (p = m.get(nm))||m.set(nm, p = []);
                        p.push(ev);
                    }
                })(n, attrs.events[n]);
        },
        setAttributes: function(control, errs, attrs) { 
            for(var i in attrs) {
                this.toAttribute.has(i) && uiUtils.setAttribute(control.ui, i, attrs[i]);
                //this.toAttribute.has(i) && ((control._attributes || (control._attributes = new Set())).add(i), uiUtils.setAttribute(control.ui, i, attrs[i]));
            }
        },
        clearEvents: function(control) {
            control._events && (control._events.forEach(function(p, nm) {
                p.forEach(function(f){ uiUtils.removeEventListener(control.ui, nm, f, false) })
            }), control._events.clear());
        }, 
        setParentNode: function(control, nodes) {
            if(control._allParentNodes = nodes) {
                if(nodes[0] != control.ui) {
                    this.detachUI(control);
                    control._deferred && control._deferred(nodes);
                }
            } else 
                this.detachUI(control);
        },      
        attachUI: function (control, nodes) {},
        detachUI: function (control) {
            var ui = control.ui;
            if(ui) {
                this.clearEvents(control);
                //this.clearAttributes(control);
                while(ui.firstChild) ui.removeChild(ui.firstChild);
                delete control.ui._dfe_;
                delete control.ui;
            }
        },
        emptyUI: function (control) { this.detachUI(control) },            
        cname: 'label-i',
        render: function (nodes, control, data, errs, attrs, events) {
            defer(null, control, data, errs, attrs, events);
            var ui = nodes && nodes[0];
            if(ui && typeof data != 'undefined') {
                this.clearEvents(control);
                this.setEvents(control.ui = ui, control, data, errs, attrs);
                control.ui._dfe_ = control;       		
                while(ui.firstChild) ui.removeChild(ui.firstChild);
                var isArr = Array.isArray(data);
                if( typeof (isArr && data[0] || data) == 'string' ) {
                    attrs.html ? (ui.innerHTML = isArr ? data.join('') : data) : (ui.innerText = isArr ? data.join('') : data);
                } else {
                    isArr ? data.forEach( function(n) { ui.appendChild(n) } ) : ui.appendChild(data)
                }
                this.setAttributes(control, errs, attrs);
            }
        }
    }, Component, _base())
})	

define('components/html', ['components/component', 'ui/utils'], function(Component, uiUtils) {
    return _extend({
        cname: 'html',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                    this.setEvents(control.ui, control, data, errs, attrs);
                }
                var isArr = Array.isArray(data);
                if( typeof (isArr && data[0] || data) == 'string' ) {
                    control.ui.innerHTML = isArr ? data.join('') : data;
                } else {
                    while(control.ui.firstChild) control.ui.removeChild(control.ui.firstChild);
                    isArr ? data.forEach( function(n) { control.ui.appendChild(n) } ) : control.ui.appendChild(data);
                }
                this.setAttributes(control, errs, attrs);
                this.appendError(control, nodes[0], errs, attrs);
            }
        }
    }, Component, _base())
})

define('components/iframe', ['components/component', 'ui/utils'], function(Component, uiUtils) {
    return _extend({
        cname: 'iframe',
        render: function (nodes, control, data, errs, attrs, events) {
            if(!defer(nodes, control, data, errs, attrs, events)) {
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('iframe'))._dfe_ = control;
                    this.setEvents(control.ui, control, data, errs, attrs);
                }
                uiUtils.setAttribute(control.ui, 'src', data.toString());
                this.setAttributes(control, errs, attrs);
                this.appendError(control, nodes[0], errs, attrs);
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
            var form = typeof attrs.form == 'object' ? attrs.form : load(attrs.form, nodes, control, data, errs, attrs, events), rt = this.runtime(control);
            Array.isArray(data)&&(data=data[0]);
            if(nodes && form) {
                form = form.form;
                if(!control.ui) {
                    nodes[0].appendChild(control.ui = document.createElement('div'))._dfe_ = control;
                    if( form.dfe.length == 1 && form.dfe[0].component.slots == 1)
                        rt.nodes = [control.ui];
                    else
                        form.dfe.forEach(function(dfe){
                            for(var i = 0; i < dfe.component.slots; i++)
                                rt.nodes.push(control.ui.appendChild(document.createElement('div')));
                        })
                }
                uiUtils.setAttribute( control.ui, "dfe-form", form.name);
                uiUtils.setAttribute( control.ui, "dfe-edit-target", attrs.editTarget? "" : undefined);
                this.setAttributes(control, errs, attrs);
                rt.runtime && rt.runtime.shutdown();
                control.ui._dfe_runtime = rt.runtime = core.startRuntime({params: {parentControl: control}, form: form, model: data||{}, node: rt.nodes});
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
                attrs.html ? (control.captionUi.innerHTML = attrs.text) : (control.captionUi.innerText = attrs.text);
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

define('components/c-switch', ['components/labeled-component', 'components/switch', 'ui/utils'], function(DWC, Switch, uiUtils) {
    return _extend({
        cname: 'c-switch',
        renderingComponent: Switch,
    }, DWC, _base())
})   
*/
