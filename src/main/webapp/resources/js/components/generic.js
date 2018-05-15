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
            let sub = [], {wrap: wrap, ...rest} = attributes, header = children.get(null);
            header && header.forEach( 
                child => sub.push( Core.createElement('span', child) ) 
            );
            children.forEach( 
                (map, row) => row && map.forEach( 
                    child => sub.push( Core.createElement('span', child) ) 
                ) 
            )
            return wrap === false ? [sub] : Core.createElement('span', attributes, sub);
        }
    }
})

define('components/div', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class Div extends BaseComponent {         
        render(data, error, attributes, children) {
            let sub = [], {wrap: wrap, ...rest} = attributes, header = children.get(null);
            header && header.forEach( 
                child => sub.push( Core.createElement('div', child) ) 
            );
            children.forEach( 
                (map, row) => row && map.forEach( 
                    child => sub.push( Core.createElement('div', child) ) 
                ) 
            )
            return wrap === false ? [sub] : Core.createElement('div', rest, sub);
        }
    }
})

define('components/inline-rows', ['dfe-core', 'components/base'], function(Core, BaseComponent) {
    return class InlineRows extends BaseComponent {         
        render(data, error, attributes, children) {
            let { singleColumn: singleColumn } = attributes;
            let rows = [], current, type = this.$node.elementInfo.type;
            let cellElement = type === 'div' || type === 'span' ? type : 'td';
            children.forEach( 
                (map, row) => map.forEach( 
                    child => {
                        if( child.control instanceof InlineRows ) {
                            rows.push( child );
                            current = undefined;
                        } else {
                            let ii = child.field.layout && child.field.layout[0];
                            if( current === undefined || !singleColumn || ii && ii.newRow ) {
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
                singleColumn: singleColumn,
                skip: skip,
                colOrder: colOrder,
                filter: filter,
                order: order,
                ...rest
            } = attributes;
            data = this.orderFilterRows(data, filter, order).map(row => row.data);
            let columns = this.orderFilterFields(skip, colOrder);
            let head = this.makeRows( columns, [null], children, 'header', {style: headerStyle, class: headerClass}, 'tr', 'th', singleColumn );
            let foot = this.makeRows( columns, [null], children, 'footer', {style: footerStyle, class: footerClass}, 'tr', 'td', singleColumn );
            let body = this.makeRows( columns, data, children, '', {style: rowStyle, class: rowClass}, 'tr', 'td', singleColumn );
            return Core.createElement('table', rest, [
                head.length && Core.createElement('thead', {}, head),
                body.length && Core.createElement('tbody', {}, body),
                foot.length && Core.createElement('tfoot', {}, foot)
            ]);
        }
        makeRows( orderedFilteredColumns, orderedFilteredRows, children, clazz, rowAttributes, rowElement, cellElement, singleColumn) {
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
                                            rows.push( Core.createElement( rowElement,  child,  layout => ({ ...layout, ...rowAttributes }) ));
                                            current = undefined;
                                        } else {
                                            let ii = child.field.layout && child.field.layout[0];
                                            if( current === undefined || singleColumn || ii && ii.newRow ) {
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
                singleColumn: singleColumn,
                skip: skip,
                colOrder: colOrder,
                filter: filter,
                order: order,
                ...rest
            } = attributes;
            data = this.orderFilterRows(data, filter, order).map(row => row.data);
            let columns = this.orderFilterFields(skip, colOrder);
            return Core.createElement('div', rest, [
                ...this.makeRows( columns, [null], children, 'header', {style: headerStyle, class: headerClass}, 'div', 'div', singleColumn ), 
                ...this.makeRows( columns, data, children, '', {style: rowStyle, class: rowClass}, 'div', 'div', singleColumn ),
                ...this.makeRows( columns, [null], children, 'footer', {style: footerStyle, class: footerClass}, 'div', 'div', singleColumn )
            ]);
        }
    }
})

define('components/validation-component', ['dfe-core', 'core-validation-component'], function(Core, CoreValidationComponent) {
    return class ValidationComponent extends CoreValidationComponent {
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

define('components/editbox', ['dfe-core', 'components/validation-component', 'ui/date-picker-polyfill'], function(Core, ValidationComponent) {
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
            doStore = doStore || this.trigger !== 'change';
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
            let { format: format, pattern: pattern, transform: transform, trigger: trigger, ...rest } = attributes;
            Object.assign(this, {format: format, pattern: pattern, transform: transform, trigger: trigger});
            return [[
                Core.createElement( 'input', { ...this.splitAttributes(rest, error), ...this.events, value: this.getValueProcessed(data.toString()) }), 
                typeof eclass !== 'string' && super.render(null, error, rest)
            ]]
        }
    }
})

define('components/editbox-money', ['components/editbox'], function(Editbox) {
    function Formatting(v, n, l) {
        do {
            v = (n?'':'$') + v.replace(/[^\d]/g,'').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        } while(l && v.length > l && (v=v.substr(0, v.length-1)));
        return v;
    }

    return class EditboxMoney extends Editbox {
        onKeyUp(e, doStore) {
            doStore = doStore || this.trigger !== 'change';
            let ui = e.target, data = this.getValueProcessed(ui.value, ui);
            doStore && this.store(data.replace(/[$,]/g,''));
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
                    options.map( opt => Core.createElement('option', { value: opt.value, text: opt.text }) )
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

define('components/html-form', ['dfe-core', 'components/div'], function(Core, Div) {
    return class HtmlForm extends Div {
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
            let body = []; //Core.createElement('div', { class: rowClass, style : rowStyle });
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
                                    head.children.push( Core.createElement('div', child, layout => ({
                                        ...layout, 
                                        ...(row.key === this.activeTab ? {class: (layout.class ? layout.class + ' ' : '') + haclass} : {}),
                                        onClick: () => this.setActiveTab(row.key)
                                    })))
                                } else {
                                    row.key === this.activeTab && body.push( Core.createElement('div', child) ); //body.children.push( Core.createElement('div', child) );
                                    //body.children.push( Core.createElement('div', child, layout => row.key === this.activeTab ? layout : ({...layout, style: 'display: none'}) ) );
                                }
                            }
                        )
                    }
                }
            )
            return Core.createElement('div', rest, [head, ...body]);
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
                        head.children.push( Core.createElement('div', child, layout => ({
                            ...layout, 
                            ...(isActive ? {class: (layout.class ? layout.class + ' ' : '') + haclass} : {}),
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
            let { format: format, pattern: pattern, transform: transform, trigger: trigger, ...rest } = attributes;
            Object.assign(this, {format: format, pattern: pattern, transform: transform, trigger: trigger});
            return [[
                Core.createElement('textarea', { ...this.splitAttributes(rest, error), ...this.events, value: this.getValueProcessed(data.toString()) }), 
                ValidationComponent.prototype.render.call(this, null, error, rest)
            ]]
        }
    }
})

define('components/child-runtime', ['dfe-core'], function(Core) {
    return class ChildRuntime extends Core.Component {
        render(data, error, attributes, children) {
            let { form: formName, editTarget: editTarget, ref: ref, ...rest } = attributes;
            let model = data[0]||{};
            ChildRuntime.setDOMAttributes(this.ref, formName, editTarget, model);
            return Core.createElement('div', { 
                ...rest, 
                ref: dom => ( ref && ref(dom), ChildRuntime.setDOMAttributes(this.ref = dom, formName, editTarget, model) )
            });
        }
        destroy() {
            let rt = this.ref && this.ref._dfe_runtime;
            if(rt) {
                rt.shutdown();
            }
            super.destroy();
        }
        static setDOMAttributes(ref, formName, editTarget, model) {
            if(ref) {
                ref.setAttribute('dfe-form', formName);
                ref.dfeModel = model;
                editTarget ? ref.setAttribute('dfe-edit-target', '') : element.removeAttribute('dfe-edit-target');
            }
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

define('components/labeled-checkbox', ['dfe-core', 'components/checkbox', 'components/labeled'], function(Core, Checkbox, Labeled) {
    return class LabeledCheckbox extends Labeled {
        getComponent() {
            return Checkbox;
        }
    }
})

define('components/labeled-editbox', ['dfe-core', 'components/editbox', 'components/labeled'], function(Core, Editbox, Labeled) {
    return class LabeledEditbox extends Labeled {
        getComponent() {
            return Editbox;
        }
    }
})

define('components/labeled-dropdown', ['dfe-core', 'components/dropdown', 'components/labeled'], function(Core, Dropdown, Labeled) {
    return class LabeledDropdown extends Labeled {
        getComponent() {
            return Dropdown;
        }
    }
})

define('components/labeled-editbox-money', ['dfe-core', 'components/editbox-money', 'components/labeled'], function(Core, EditboxMoney, Labeled) {
    return class LabeledEditboxMoney extends Labeled {
        getComponent() {
            return EditboxMoney;
        }
    }
})

define('components/labeled-radiolist', ['dfe-core', 'components/radiolist', 'components/labeled'], function(Core, Radiolist, Labeled) {
    return class LabeledRadiolist extends Labeled {
        getComponent() {
            return Radiolist;
        }
    }
})

define('components/editbox-popup', ['dfe-core', 'components/editbox', 'components/textarea'], function(Core, Editbox, Textarea) {
    class EditboxPopup extends Editbox {
        constructor(node) {
            super(node);
            let editBoxKeyDownEvent = this.events.onKeyDown;
            this.popup = new Core.RenderNode( node, { component: Textarea, set: (_, value) => this.store(this.setMapper(value)) }, node.unboundModel );
            this.ref = null;
            this.focusInterval = null;
            this.popupAttributes = {};
            this.scrollFollow = () => this.renderPopup();
            this.memorizedDims = '';
            this.events = {
                ...this.events,
                onKeyDown: e => (this.popupEvent(e), editBoxKeyDownEvent(e)),
                onFocus: () => this.renderPopup(true)
            }
        }
        render(value, error, attributes, children) {
            let { ta : popupAttributes, ref: ref, ...rest } = attributes;
            this.popupAttributes = popupAttributes;
            this.popupData = this.getMapper(value);
            this.popupError = error;
            this.renderPopup();
            return super.render(value, error, { ref: dom => (this.ref = dom, ref && ref(dom)), ...rest }, children);
        }
        renderPopup(show) {
            let popup = this.popup, active = this.popupContainer && this.popupContainer.parentNode;
            if( active || show ) {
                popup.shouldRender = true;
                popup.setDom({ type: 'div' }, this.ref.ownerDocument.body, null);
                popup.render(this.popupData, this.popupError, this.mapPopupAttributes());
                if(!active) {
                    for(let element = this.ref.parentElement; element; element = element.parentElement) {
                        element.addEventListener('scroll', this.scrollFollow);
                    }
                    this.focusInterval = setInterval(() => {
                        this.ref.ownerDocument.activeElement !== this.ref && !this.resizeOngoing && !this.popupContainer.contains(this.ref.ownerDocument.activeElement) && this.hidePopup();
                    }, 30);
                }
            }
        }
        hidePopup() {
            clearInterval(this.focusInterval);
            this.popup.setDom({ type: 'div' }, null, null);
            for(let element = this.ref.parentElement; element; element = element.parentElement) {
                element.removeEventListener('scroll', this.scrollFollow);
            }
        }
        popupEvent(e) {
            if(e.key === 'Esc' || e.key === 'Escape') {
                this.hidePopup();
            }
            if(e.key === 'Enter') {
                this.renderPopup(true);
            }
            if(e.key === 'Tab' && this.popupContainer && this.popupContainer.parentNode ) {
                (e.target === this.ref ? this.popupContainer.firstChild : this.ref).focus();
                e.preventDefault();
            }
        }
        mapPopupAttributes() {
            let { offsetTop: offsetTop, offsetLeft: offsetLeft, style: style, editorClass: editorClass, ...rest } = this.popupAttributes;
            let r = this.ref.getBoundingClientRect(), op = this.ref.offsetParent, wnd = this.ref.ownerDocument.defaultView||window;
            let display = (op.scrollTop > this.ref.offsetTop + this.ref.offsetHeight || op.scrollTop + op.clientHeight < this.ref.offsetTop + this.ref.offsetHeight) ? 'none' : '';
            let top = (r.bottom + 2 + (wnd.scrollY||wnd.pageYOffset) + (offsetTop||0)) + 'px';
            let left = (r.left + (wnd.scrollX||wnd.pageXOffset) + (offsetLeft||0)) + 'px';
            return {
                class: editorClass,
                events: { onKeyDown: e => this.popupEvent(e) },
                ref: dom => this.setupPopup(dom.parentNode),
                attributeMapper: () => ({ ...rest, style : (style ? style + ';' : '') + 'display:' + display + ';top:' + top + ';left:' + left + ';' + this.memorizedDims })
            }
        }
        setupPopup(div) {
            this.popupContainer = div;
            let document = this.ref.ownerDocument, window = document.defaultView||window;
            let rect = div.getBoundingClientRect();
            let width = rect.right - rect.left;
            let height = rect.bottom - rect.top;
            let handle = document.createElement('span');
            div.appendChild(handle);
            handle.setAttribute('class', 'ui-resizeable-handle-br');
            handle.addEventListener('mousedown', e => {
                this.resizeOngoing = true;
                let ox = e.screenX, oy = e.screenY, move, up;
                document.addEventListener('mousemove', move = e => {
                    div.style.width = (width + e.screenX - ox) + 'px';
                    div.style.height = (height + e.screenY - oy) + 'px';
                    e.preventDefault(), window.getSelection().removeAllRanges();
                    this.onResize();
                });
                document.addEventListener('mouseup', up = () => {
                    this.resizeOngoing = false;
                    div.querySelector("textarea, input").focus();
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                    rect = div.getBoundingClientRect(), width = rect.right - rect.left, height = rect.bottom - rect.top;
                    this.memorizedDims = 'width:' + width + 'px;height:' + height + 'px';
                });
            });
        }
        onResize() {}
        getMapper(value) { 
            return value; 
        }
        setMapper(value) { 
            return value; 
        }
    }
    return EditboxPopup;
})

/* TODO: 
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

*/