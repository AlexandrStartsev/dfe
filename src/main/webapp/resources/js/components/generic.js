define('components/base', ['dfe-core'], function(Core) {
    return class BaseComponent extends Core.Component {
        render(data, error, attributes, children) {
            return data.toString();
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
                    child => sub.push( Core.createElement('span', child) ) 
                )
            )
            return Core.createElement('span', attributes, sub);
        }
    }
})

define('components/div', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class Div extends BaseComponent {         
        render(data, error, attributes, children) {
            let sub = [];
            children.forEach( 
                (map, row) => map.forEach( 
                    child => sub.push( Core.createElement('div', child) ) 
                )
            )
            return Core.createElement('div', attributes, sub);
        }
    }
})

define('components/inline-rows', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class InlineRows extends BaseComponent {         
        render(data, error, attributes, children) {
            let { element: cellElement, singles: singles } = attributes;
            let rows = [], current;
            if(['div', 'span', 'td'].indexOf(cellElement) === -1) {
                cellElement = 'td';
            }
            children.forEach( 
                (map, row) => map.forEach( 
                    child => {
                        if( child.control instanceof InlineRows ) {
                            rows.push( child );
                            current = undefined;
                        } else {
                            let ii = child.field.pos && child.field.pos[0];
                            if( current === undefined || !singles || ii && ii.newRow ) {
                                rows.push( current = [] );
                            }
                            current.push( Core.createElement( cellElement, child ) );
                        }
                    }
                )
            )
            return rows;
        }
    }
})

define('components/table', ['dfe-core', 'components/base', 'components/inline-rows'], function(Core, BaseComponent, InlineRows) {
    return class Table extends BaseComponent {
        constructor(node){
            super(node);
            this.allColumns = node.field.children;
            this.form = node.form;
        }
        render(data, error, attributes, children) {
            let {
                rowclass$header: headerClass,
                rowstyle$header: headerStyle, 
                rowclass$footer: footerClass,
                rowstyle$footer: footerStyle,
                rowclass: rowClass,
                rowstyle: rowStyle, 
                singles: singles,
                skip: skip,
                colOrder: colOrder,
                filter: filter,
                order: order,
                ...rest
            } = attributes;
            data = this.orderFilterRows(data, filter, order).map(row => row.data);
            let columns = this.orderFilterFields(skip, colOrder);
            let head = this.makeRows( columns, [null], children, 'header', {style: headerStyle, class: headerClass}, 'tr', 'th', singles );
            let foot = this.makeRows( columns, [null], children, 'footer', {style: footerStyle, class: footerClass}, 'tr', 'td', singles );
            let body = this.makeRows( columns, data, children, '', {style: rowStyle, class: rowClass}, 'tr', 'td', singles );
            return Core.createElement('table', rest, [
                head.length && Core.createElement('thead', {}, head),
                body.length && Core.createElement('tbody', {}, body),
                foot.length && Core.createElement('tfoot', {}, foot)
            ]);
        }
        makeRows( orderedFilteredColumns, orderedFilteredRows, children, clazz, rowAttributes, rowElement, cellElement, singles) {
            let rows = [];
            orderedFilteredRows.forEach(
                row => {
                    let map = children.get(row), current;
                    if(map) {
                        orderedFilteredColumns.forEach(
                            field => {
                                if((field.class||'') === clazz) {
                                    let child = map.get(field);
                                    if( child ) {
                                        if( child.control instanceof InlineRows ) {
                                            rows.push( Core.createElement( rowElement,  child,  pos => ({ ...pos, ...rowAttributes }) ));
                                            current = undefined;
                                        } else {
                                            let ii = child.field.pos && child.field.pos[0];
                                            if( current === undefined || singles || ii && ii.newRow ) {
                                                rows.push( current = Core.createElement(rowElement, { key: row ? row.key : 0, ...rowAttributes }));
                                            }
                                            current.children.push( Core.createElement( cellElement, child ) );
                                        }
                                    }
                                }
                            }
                        )
                    }
                }
            )
            return rows;
        }
        orderFilterFields(skip, colOrder) {
            let columns = skip ? this.allColumns.filter( columns => typeof skip === 'function' ? !skip.call(this.form, columns.name) : skip.indexOf(columns.name) === -1 ) : this.allColumns;
            return typeof colOrder === 'function' ? columns.sort((c1, c2) => colOrder.call(this.form, c1.name, c2.name) ) : columns;
        }
        orderFilterRows(allRows, filter, order) {
            if(typeof filter == 'function') {
                allRows = allRows.filter(filter);
            }
            return (typeof order == 'function' ? allRows.sort(order) : allRows);
        }
    }
})

define('components/div-r', ['dfe-core', 'components/table'], function(Core, Table) {
    return class DivR extends Table {
        render(data, error, attributes, children) {
            let {
                rowclass$header: headerClass,
                rowstyle$header: headerStyle, 
                rowclass$footer: footerClass,
                rowstyle$footer: footerStyle,
                rowclass: rowClass,
                rowstyle: rowStyle,
                singles: singles,
                skip: skip,
                colOrder: colOrder,
                filter: filter,
                order: order,
                ...rest
            } = attributes;
            data = this.orderFilterRows(data, filter, order).map(row => row.data);
            let columns = this.orderFilterFields(skip, colOrder);
            return Core.createElement('div', rest, [
                ...this.makeRows( columns, [null], children, 'header', {style: headerStyle, class: headerClass}, 'div', 'div', singles ), 
                ...this.makeRows( columns, data, children, '', {style: rowStyle, class: rowClass}, 'div', 'div', singles ),
                ...this.makeRows( columns, [null], children, 'footer', {style: footerStyle, class: footerClass}, 'div', 'div', singles )
            ]);
        }
    }
})

define('components/validation-component', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class ValidationComponent extends BaseComponent {
        doValidation(events, attrs) {
            let vs = (attrs.vstrategy||'').split(' ');
            delete attrs.vstrategy;
            if( vs.indexOf('none') != -1 || vs.indexOf('disabled') == -1 && (attrs.disabled || attrs.hidden) ) {
                return false;
            }
            if( vs.indexOf('always') != -1 || vs.indexOf('followup') != -1 && this.$node.stickyError ) {
                return true;
            }
            if( vs.indexOf('notified') != -1 && events[0].action != 'init' ) {
                return true;
            }
            return events.some(e => 'validate' === e.action); 
        }
        render(data, error, attributes, children) {
            return !!error && !attributes.hideError && Core.createElement('label', {class: 'dfe-error', text: error.toString()})
        }
        splitAttributes(attributes, error) {
            let ret = {}, hideError = attributes.hideError;
            if( !!error && !hideError && attributes.eclass ) {
                ret.class = (attributes.class ? attributes.class + ' ' : '') + attributes.eclass;
                hideError = true;
                delete attributes.class;
            }
            delete attributes.eclass;
            delete attributes.hideError;
            Object.getOwnPropertyNames(attributes).forEach( 
                a => { 
                    ret[a] = attributes[a]; 
                    delete attributes[a]; 
                }
            )
            if( hideError ) {
                attributes.hideError = true ;
            }
            return ret;
        }
    }
})

define('components/label', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    return class Label extends ValidationComponent {
        render(data, error, attributes, children) {
            let { html: html, text: text, label: label, hideError: hideError, ...rest } = attributes;
            return [[ 
                html || label ? Core.createElement('label', {text: label, html: html, ...rest}) : text || data.toString(),
                super.render(null, error, {hideError: hideError}, children)
            ]]
        }
    }
}) 

define('components/labeled-component', ['dfe-core', 'components/label'], function(Core, Label) {
    return class Labeled extends Label {
        render(data, error, attributes, children) {
            let firstChild;
            children.forEach(map => map.forEach(child => firstChild || (firstChild = child) ));
            return [ 
                ...super.render("not specified", error, attributes, children), 
                firstChild
            ]
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
            this.events = {
                onKeyDown: e => this.onKeyDown(e),
                onKeyUp: e => this.onKeyUp(e),
                onChange: e => this.onKeyUp(e, true)
            }
        }
        onKeyUp(e, doStore) {
            doStore = doStore || this.trigger !== 'store';
            let data = Patterning(Formatting(e.target.value, this.format), this.pattern); 
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
                let m, v;
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
            if(ui && data != ui.value) {
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
            let { formatting: format, pattern: pattern, transform: transform, trigger: trigger, ...rest } = attributes;
            Object.assign(this, {format: format, pattern: pattern, transform: transform, trigger: trigger});
            return [[
                Core.createElement( 'input', { ...this.splitAttributes(rest, error), ...this.events, value: this.getValueProcessed(data.toString()) }), 
                typeof eclass !== 'string' && super.render(null, error, rest)
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
            let ui = e.target, data = this.getValueProcessed(ui.value, ui);
            store && this.store(data);
        }
        onKeyDown(e) {
            let ui = e.target, ml = (this.format && this.format.length) < Formatting(ui.value + '1', this.format && this.format.charAt(0) != '$', 99).length;
            if((e.key == ',' || e.key == 'Delete' || e.key == 'Del') && ui.value.charAt(ui.selectionStart) == ',') ui.selectionStart++;
            if((e.key == 'Delete' || e.key == 'Del') && ui.value.charAt(ui.selectionStart) == '$') ui.selectionStart++;
            !e.ctrlKey && e.key && e.key.length == 1 && ui.selectionStart == ui.selectionEnd && (e.key < '0' || e.key > '9' || ml) && e.preventDefault();
        }
        getValueProcessed(data, ui) {
            Array.isArray(data) && (data=data[0]);
            data = (typeof data == 'string' || typeof data == 'number') ? Formatting(data, this.format && this.format.charAt(0) != '$', this.format && this.format.length) : '';
            if(data === '$') data = '';
            if(ui && data != ui.value) {
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
    }
})

define('components/button', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    return class Button extends ValidationComponent {
        render(data, error, attributes, children) {
            let value = data.toString(), {...rest} = attributes;
            return [[
                Core.createElement('input', { ...this.splitAttributes(rest, error), value: value, type: 'button', onClick: () => this.store(value, 'click') }),
                super.render(null, error, rest)
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
            let {...rest} = attributes;
            let checked = data && (typeof data === 'object' ? data.checked && data.checked.toString().match(/Y|y/) : data.toString().match(/Y|y/));
            let text = typeof data === 'object' && data.text;
            return [[
                Core.createElement('input', { ...this.splitAttributes(rest, error), checked: !!checked, type: 'checkbox', onChange: e => this.store(e.target.checked ? 'Y' : 'N') }),
                text,
                super.render(null, error, rest)
            ]]
        }
    }
})

define('components/dropdown', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    function testChoice(a, b) {
        return a == b || typeof a === 'object' && typeof b === 'object' && Object.getOwnPropertyNames(a).every(i => a[i] == b[i]);
    }
    return class Dropdown extends ValidationComponent {
        render(data, error, attributes, children) {
            let {'default': def, ...rest} = attributes;
            let options = def ? [{text: 'Please select...', value: def}] : [];
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
                    { ...this.splitAttributes(rest, error), selectedIndex: selectedIndex, onChange: e => this.store(options[e.target.selectedIndex].value) },
                    options.map( opt => Core.createElement('option', { text: opt.text }) )
                ),
                super.render(null, error, rest)
            ]]
        }
    }
})

define('components/html', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class Html extends BaseComponent {
        render(data, error, attributes, children) {
            return Core.createElement('span', { ...attributes, html: data });
        }
    }
})

define('components/form', ['dfe-core', 'components/div'], function(Core, Div) {
    return class Form extends Div {
        render(data, error, attributes, children) {
            let {name: name, id: id, action: action, method: method, target: target, ...rest} = attributes;
            return Core.createElement('form', { name: name, id: id, action: action, method: method, target: target }, [super.render(data, error, rest, children)]);
        }
    }
})

define('components/tab-s', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class TabS extends BaseComponent {
        constructor(node){
            super(node);
            this.activeTab = -1;
            this.lastRows = new Set();
        }
        setActiveTab(key) {
            if(this.activeTab !== key) {
                this.activeTab = key;
                this.update(); 
            }
        }
        render(data, error, attributes, children) {
            let {
                rowclass$header: headerClass,
                rowstyle$header: headerStyle, 
                rowclass: rowClass,
                rowstyle: rowStyle,
                headField: headField,
                focusnew: focusnew,
                haclass: haclass,
                ...rest
            } = attributes, nextRows = new Set();
            let head = Core.createElement('div', { class: headerClass, style : headerStyle });
            let body = Core.createElement('div', { class: rowClass, style : rowStyle });
            this.activeTab = data.some(proxy => this.activeTab === proxy.data.key) ? this.activeTab : data[0] && data[0].data.key;
            data.forEach(proxy => {
                let key = proxy.data.key;
                nextRows.add(key);
                this.lastRows.has(key) || this.lastRows.size && focusnew && (this.activeTab = key);
            })
            headField = headField || 'header';
            this.lastRows = nextRows;
            children.forEach(
                (map, row) => {
                    if(row) {
                        map.forEach(
                            (child, field) => {
                                if( field.name === headField ) {
                                    head.children.push( Core.createElement('div', child, pos => ({
                                        ...pos, 
                                        ...(row.key === this.activeTab ? {class: (pos.class ? pos.class + ' ' : '') + haclass} : {}),
                                        onClick: () => this.setActiveTab(row.key)
                                    })))
                                } else {
                                    row.key === this.activeTab && body.children.push( Core.createElement('div', child) );
                                }
                            }
                        )
                    }
                }
            )
            return Core.createElement('div', rest, [head, body]);
        }
    }
})

define('components/tab-d', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    class ActiveTabHandler {
        prepare(children) {
            throw new Error('Not implemented')
        }
        activeTab(model) {
            throw new Error('Not implemented');
        }
        store(model) {}
    }
    return class TabD extends BaseComponent {
        constructor(node){
            super(node);
            this.handler = new ActiveTabHandler(this);
            this.allColumns = node.field.children;
        }
        render(data, error, attributes, children) {
            let {
                rowclass$header: headerClass,
                rowstyle$header: headerStyle, 
                rowclass: rowClass,
                rowstyle: rowStyle,
                haclass: haclass,
                activeTab: activeTab,
                ...rest
            } = attributes;
            let useHandler = typeof activeTab !== 'function';
            if(useHandler) {
                this.handler.prepare(children);
            }
            
            let head = Core.createElement('div', { class: headerClass, style : headerStyle });
            let body = Core.createElement('div', { class: rowClass, style : rowStyle });
            let headField = this.allColumns.filter(field => !field.class).pop();
            data.forEach(
                model => {
                    let child = children.get(model.data).get(headField), isActive = (useHandler ? this.handler.activeTab : activeTab)(model);
                    if(child) {
                        head.children.push( Core.createElement('div', child, pos => ({
                            ...pos, 
                            ...(isActive ? {class: (pos.class ? pos.class + ' ' : '') + haclass} : {}),
                            onClick: () => (this.handler.store(model), this.store(model))
                        })));
                    }
                }
            )
            children.get(null).forEach(
                (child, field) => field.name === (useHandler ? this.handler.activeTab : activeTab)() && body.children.push( Core.createElement('div', child) )
            )
            return Core.createElement('div', rest, [head, body]);
        }
    }
})

define('components/div-c', ['dfe-core', 'components/table'], function(Core, Table) {
    return class DivC extends Table {
        render(data, error, attributes, children) {
            let {
                rowclass: rowClass,
                rowstyle: rowStyle,
                skip: skip,
                colOrder: colOrder,
                filter: filter,
                order: order,
                ...rest
            } = attributes;
            let fields = {
                header: [], 
                footer: [], 
                "": [] 
            }
            let rows = this.orderFilterRows(data, filter, order);
            this.orderFilterFields(skip, colOrder).forEach( 
                field => fields[field.class||''].push(field) 
            )
            let columns = fields[""].map(
                field => Core.createElement( 'div', { key: field.name, style: rowStyle, class: rowClass} ) 
            );
            this.toColumns(children.get(null), fields.header, columns);
            rows.forEach( model => this.toColumns(children.get(model.data), fields[""], columns) );
            this.toColumns(children.get(null), fields.footer, columns);
            return Core.createElement('div', rest, columns);
        }
        toColumns(map, fields, out) {
            if(map) {
                map.forEach(
                    (child, field) => {
                        let column = out[ fields.indexOf(field) ];
                        if( column ) {
                            column.children.push( Core.createElement('div', child ) )
                        }
                    }
                )
            }
        }
    }
})

define('components/radiolist', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    function testChoice(a, b) {
        return a == b || typeof a === 'object' && typeof b === 'object' && Object.getOwnPropertyNames(a).every(i => a[i] == b[i]);
    }
    let radioNameCounter = 0;
    return class Radiolist extends ValidationComponent {
        constructor(node) {
            super(node);
            this.defaultName = 'Radiolist#' + (++radioNameCounter);
        }
        render(data, error, attributes, children) {
            let { orientation: orientation, ...rest } = attributes;
            let normalized = (Array.isArray(data) ? data[0] : data)||'N';
            if(typeof normalized === 'string') {
                normalized = {value: data, items: [{value :'Y', description : 'Yes'}, {value :'N', description : 'No'}]}
            }
            return [[
                ...Array.prototype.concat.apply([], normalized.items.map(
                    item => [
                        Core.createElement('input', {
                            name: this.defaultName,
                            ...this.splitAttributes(rest, error), 
                            type: 'radio', 
                            checked: testChoice( normalized.value, item.value ), 
                            onChange: () => this.store(item.value)
                        }), 
                        item.description || item.value.toString(),
                        orientation === 'vertical' && Core.createElement('br') 
                    ]
                )), super.render(null, error, rest)
            ]]
        }
    }
}) 

define('components/iframe', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class Iframe extends BaseComponent {
        render(data, error, attributes, children) {
            return Core.createElement('iframe', { src: data.toString(), ...attributes });
        }
    }
}) 

define('components/textarea', ['dfe-core', 'components/editbox', 'components/validation-component'], function(Core, Editbox, ValidationComponent) {
    return class Textarea extends Editbox {
        render(data, error, attributes, children) {
            let { formatting: format, pattern: pattern, transform: transform, trigger: trigger, ...rest } = attributes;
            Object.assign(this, {format: format, pattern: pattern, transform: transform, trigger: trigger});
            return [[
                Core.createElement('textarea', { ...this.splitAttributes(rest, error), ...this.events, value: this.getValueProcessed(data.toString()) }), 
                ValidationComponent.prototype.render.call(this, null, error, rest)
            ]]
        }
    }
})

define('components/dfe-runtime', ['dfe-core'], function(Core) {
    return class ChildRuntime extends Core.Component {
        render(data, error, attributes, children) {
            // TODO ... 
            let { form: formName, editTarget: editTarget, ...rest } = attributes;
            let model = (Array.isArray(data) ? data[0] : data) || {}
            if( this.formName !== formName ) {
                this.runtime && this.runtime.shutdown();
                require([formName], 
                    formClass => this.runtime = Core.startRuntime({
                        params: {parentControl: null}, 
                        form: formClass, 
                        model: model, 
                        node: this.domElement
                    })
                )
            }
            if( this.domElement ) {
                element.setAttribute('dfe-form', formName);
                editTarget ? element.setAttribute('dfe-edit-target', '') : element.removeAttribute('dfe-edit-target');
            }
            return Core.createElement('div', { ...rest, ref: element => {
                this.domElement = element;
                element.setAttribute('dfe-form', formName);
                if( editTarget ) {
                    element.setAttribute('dfe-edit-target', '');
                }
                if( this.runtime ) {
                    this.runtime.setRoot(element);
                }
            }})
        }
        destroy() {
            this.runtime && this.runtime.shutdown();
            super.destroy();
        }
    }
})

define('components/div-button', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    return class DivButton extends ValidationComponent {
        render(data, error, attributes, children) {
            let value = data.toString(), {...rest} = attributes;
            return (
                Core.createElement('div', { ...this.splitAttributes(rest, error), onClick: () => this.store(value, 'click') }, [
                    Core.createElement('label', { class: 'div-button-text', html: value }),
                    super.render(null, error, rest)
                ])
            )
        }
    }   
})

define('components/multioption', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    return class Multioption extends ValidationComponent {
        render(data, error, attributes, children) {
            let value = data.value.toString(), {...rest} = attributes;
            return (
                Core.createElement('div', { ...this.splitAttributes(rest, error) }, [
                    ...Array.prototype.concat.apply([], data.options.map(
                        option => [
                            Core.createElement('input', { 
                                type: 'checkbox', 
                                checked: option === value, 
                                onChange: e => this.store(e.target.checked ? option : []) 
                            }),
                            option
                        ]
                    )),
                    super.render(null, error, rest)
                ])
            )
        }
    }   
})

define('components/labeled', ['dfe-core', 'components/validation-component'], function(Core, ValidationComponent) {
    return class Labeled extends ValidationComponent {
        constructor(node) {
            super(node);
            this.renderComponent = this.getComponent().prototype.render.bind(new (this.getComponent())(node));
        }
        render(data, error, attributes, children) {
            let { cclass: cclass, cstyle: cstyle, text: text, label: label, html: html, hideError: hideError, ...rest } = attributes;
            return [[
                html || label || cclass || cstyle ? Core.createElement('label', { class: cclass, style: cstyle, text: label || text, html: html }) : text,
                super.render(null, error, { hideError: hideError })
            ], ...this.renderComponent(data, null, rest, children) ]
        }
    }
})

define('components/c-checkbox', ['dfe-core', 'components/checkbox', 'components/labeled'], function(Core, Checkbox, Labeled) {
    return class LabeledCheckbox extends Labeled {
        getComponent() {
            return Checkbox;
        }
    }
})

define('components/c-editbox', ['dfe-core', 'components/editbox', 'components/labeled'], function(Core, Editbox, Labeled) {
    return class LabeledEditbox extends Labeled {
        getComponent() {
            return Editbox;
        }
    }
})

define('components/c-dropdown', ['dfe-core', 'components/dropdown', 'components/labeled'], function(Core, Dropdown, Labeled) {
    return class LabeledDropdown extends Labeled {
        getComponent() {
            return Dropdown;
        }
    }
})

define('components/c-editbox-$', ['dfe-core', 'components/editbox-$', 'components/labeled'], function(Core, EditboxMoney, Labeled) {
    return class LabeledEditboxMoney extends Labeled {
        getComponent() {
            return EditboxMoney;
        }
    }
})

define('components/c-radiolist', ['dfe-core', 'components/radiolist', 'components/labeled'], function(Core, Radiolist, Labeled) {
    return class LabeledRadiolist extends Labeled {
        getComponent() {
            return Radiolist;
        }
    }
})

/*  TODO: 

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
*/
