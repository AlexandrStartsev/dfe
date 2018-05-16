define('components/editbox-code', ['dfe-core', 'ace/ace', 'ui/jquery', 'uglify'], function(Core, ace, jQuery, uglify) {
    //little how-to: https://ace.c9.io/#nav=howto&api=virtual_renderer
    //https://github.com/ajaxorg/ace
    //https://github.com/ajaxorg/ace/wiki/Syntax-validation
    //_addEventListener(window, 'load', function() {

    let aceEditor = ace.edit(document.createElement('div'));
    aceEditor.container.style.width = aceEditor.container.style.height = '100%';
    aceEditor.container.style.fontSize = '14px';
    aceEditor.setTheme('ace/theme/eclipse');  //dawn, eclipse, iplastic, kuroir, textmate
    aceEditor.setShowPrintMargin(false);
    aceEditor.$blockScrolling = Infinity;
    aceEditor.commands.on('exec', function(e) {
       e.command.name == 'Esc' && aceEditor.completer.popup && aceEditor.completer.popup.isOpen && e.stopPropagation();
    });
    //rt.session.setUseSoftTabs(true);
    // intellisense: https://stackoverflow.com/questions/26239090/javascript-intellisense-in-ace-editor
    ace.config.loadModule('ace/ext/tern', function () {
                /* taken from http://sevin7676.github.io/Ace.Tern/demo.html#html */
                /* http://ternjs.net/doc/manual.html#option_defs */
                /* http://ternjs.net/doc/manual.html#plugins */    
        aceEditor.setOptions({
            enableTern: {
                defs: ['browser', 'ecma6', 'ecma5', 'jquery'], 
                plugins: { 
                    doc_comment: { fullDocs: true } 
                }, 
                //useWorker: false, 
                startedCb: function () {
                	jQuery('script').each(function(){ 
                		if(this.src.match(/components\/editbox-code.js$/)) {
                			var url = this.src, src = ['ui/utils', 'dfe-core', 'dfe-common', 'ace/dfe-hints']; // $('script').each( ... )
                			jQuery.when.apply(jQuery, src.map(function(s) { return jQuery.get(url.replace(/components\/editbox-code/, s), 0, 0, 'text')})).done(function() {
                				for(var i = 0; i < arguments.length; i++) {
                					aceEditor.ternServer.addDoc(src[i], arguments[i][0]);
                					for(var b = uglify.parse(arguments[i][0]).body, j = 0, f, n; j < b.length; j++)
                						if(b[j].body && b[j].body.args && (f = b[j].body.args.pop()) instanceof uglify.AST_Function && (n = b[j].body.args[0]) instanceof uglify.AST_String ) 
                							aceEditor.ternServer.addDoc(n.value.replace(/[^\w]/g,'_'), 'var ' + n.value.replace(/[^\w]/g,'_') + ' = (' + f.print_to_string() + ')()');
                                }
                            });
                		}
                	})
                },
            },
            enableSnippets: true,
            enableBasicAutocompletion: true,
        });
    });
    
    function needsReturn(code) {
	    try {
	        var fbody = uglify.parse('function foo($$) {' + code + '}').body[0].body;
	        return fbody.length == 1 && (fbody[0] instanceof uglify.AST_SimpleStatement || fbody[0] instanceof uglify.AST_Directive || 
	            fbody[0] instanceof uglify.AST_BlockStatement && 
	            fbody[0].body.filter(function(b) { return !(b instanceof uglify.AST_LabeledStatement) }).length === 0 );
	    } catch(e) { return true }
	}
    function formatCode(text, func) {
        try {
            if(func) {
                text || (text = func.template)
                text = uglify.parse('v=' + text).print_to_string({ quote_style: 3, beautify: true, comments: true }).replace(/^v = |;$/g,'');
                if(text.indexOf('(') == 0) {// Arrow function
                    text = text.substr(1, text.length - 2);
                } else {
                    text = text.replace(/^function/,'function foo');
                }
            }
        } catch (e) {}
        return (text||'').toString();
    }
    
    return class EditboxCode extends Core.Component {
        constructor(node) {
            super(node);
            this.session = null;
            this.func = null;
            this.editorHousing = null;
        }
        render(data, error, attributes, children) {
            let { func: func, lang: lang, ...rest } = attributes;
            let code = formatCode(data.toString(), func);
            
            this.func = func;
            if(!this.session) { 
                this.session = ace.createEditSession( code, 'ace/mode/' + (lang||'javascript') );
                this.session.on( 'change', () => this.store(this.session.getValue()) ); // new Error().stack.indexOf('.setValue') === -1 && 
            } else {
                aceEditor.container.contains(aceEditor.container.ownerDocument.activeElement) || this.session.setValue(code);
            }
            aceEditor.setSession(this.session);
            return Core.createElement('div', { ...rest, ref: dom => this.editorHousing = dom, html: aceEditor.container })
        }
        destroy() {
            if(this.session) {
                this.session.destroy();
            }
        }
        /*store(value) {
            if(this.func) {
                if(!value) {
                    value = this.func.template || '() => 1';
                }
                try { 
                    let r = uglify.parse('v=' + value).body[0].body.right; 
                    if(r instanceof uglify.AST_Arrow || r instanceof uglify.AST_Function ) {
                        super.store(value);
                        return ;
                    }
                } catch (e) {}
                try {
                    let r = uglify.parse( 'v=' + value ).body[0].body.right; 
                    if( r instanceof uglify.AST_Function ) {
                        let ret = r.body.some( s => s instanceof uglify.AST_Return );
                        r.body = [];
                        value = r.print_to_string({ quote_style: 3, comments: true }).replace(/\{\}$/,'{' + (ret || needsReturn(value) ? 'return ' : '') + value + '}');
                    } else { // Arrow
                        let pv = uglify.parse(value);
                        r.body = pv.body.length == 1 ? pv.body[0] : pv.body;
                        value = r.print_to_string({ quote_style: 3, comments: true });
                    }
                } catch (e) { }
            }
            super.store(value);
        }*/
    }
})

// TODO: trainwreck... 

define('components/editbox-code-popup', ['dfe-core', 'components/editbox-popup'], function(Core, EditboxPopup, ace, jQuery, uglify) {
    
    
    class EditboxPopupCode extends EditboxPopup {
        constructor(node){
            super(node);
            this.popup = Core.createNode( node, { component: Textarea, set: (_, value) => this.store(this.setMapper(value)) }, node.unboundModel );
        }
        onResize() {}
        getMapper(value) { 
            return value; 
        }
        setMapper(value) { 
            return value; 
        }
        getPopupActiveElement() {
            return this.popupContainer.firstChild;
        }
    }
    
        function formatInlineCode(text, func) {
        if(text!=0) {
            if(func) {
                var ast = uglify.parse('v=' + text).body[0].body.right; // instanceof uglify.AST_Arrow
                text = (Array.isArray(ast.body) ? ast.body : [ast.body]).map(function(s) { 
                    return s.print_to_string({ quote_style: 3, beautify: false, comments: true })}).join('; ').replace(/^return */,'');
            }
            return text;
        }
        return '';
    }
    
    return EditboxPopupCode;
    
    return _extend({
        cname: 'editbox-code',
        setValue: function(control, data, errs, attrs) {
            var val = formatInlineCode(data, attrs.ta && attrs.ta.func);
            if( !errs && control.ui != control.ui.ownerDocument.activeElement ) {
                control.ui.value === val || (control.ui.value = val);
                control.currentValue = control.ui.value;
            } else {
                control.currentValue = val;
            }
        },
        store: function(control, value, method) { 
            var a = control.model.attrs;
            if(a.ta && a.ta.func && value) {
                try { 
                    var r = uglify.parse('v=' + value).body[0].body.right; 
                    if(r instanceof uglify.AST_Arrow || r instanceof uglify.AST_Function )
                        return control.model.runtime.store(control, value, method);
                } catch (e) {}
                try { 
                    var r = uglify.parse('v=' + (this.data || a.ta.func.template || '() => 1')).body[0].body.right; 
                    if(r instanceof uglify.AST_Function) {
                        var ret = 0;
                        r.body.forEach(function(s) { ret |= s instanceof uglify.AST_Return });
                        r.body = [];
                        value = r.print_to_string({ quote_style: 3, comments: true }).replace(/\{\}$/,'{' + (ret || needsReturn(value) ? 'return ' : '') + value + '}');
                    } else { // Arrow
                        var pv = uglify.parse(value);
                        r.body = pv.body.length == 1 ? pv.body[0] : pv.body;
                        value = r.print_to_string({ quote_style: 3, comments: true });
                    }
                } catch (e) {}
            }
            control.model.runtime.store(control, value, method);
        },
        updatePopupContent: function(control, data, attrs) {
            var rt = this.runtime(control);
            !(rt.ta && rt.ta.contains(control.ui.ownerDocument.activeElement)) && rt.session && rt.session.setValue(formatPopupCode(data, attrs.ta.func));
        },
        getPopupUi: function(control) {
            var attrs = control.model.attrs, rt = this.runtime(control);
            if(!rt.session) { 
                rt.session = require('ace/ace').createEditSession(formatPopupCode(control.data, attrs.ta.func), 'ace/mode/' + (attrs.ta.lang||'javascript'));
                rt.session.on('change', function(e) { new Error().stack.indexOf('.setValue') == -1 && control.component.store(control, rt.session.getValue()) });
            }
            aceEditor.setSession(rt.session);
            return aceEditor.container;
        },
        onResize: function(control) { aceEditor.resize() },
        getPopupActiveElement: function(control) { return aceEditor.renderer.textarea },
        onClosePopup: function(control) {},
        purge: function (control) { var rt = this.runtime(control); rt.session && rt.session.destroy(); this.emptyUI(control); },
        setPopupAttributes: function(control, attrs, errs) {
            CEditPopup.setPopupAttributes.call(this, control, attrs, errs);
            this.runtime(control).ta && (this.getPopupUi(control).style.fontSize = attrs.fontSize||'14px', aceEditor.resize());
        }
    }, CEditPopup, CEditPopup.base())
})
