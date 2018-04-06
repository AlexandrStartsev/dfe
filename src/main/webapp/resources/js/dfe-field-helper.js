define('dfe-field-helper', ['dfe-common'], function(cmn) {
	return {
        simple: function(field, val, attrs) {
        	var hasVal = Array.isArray(val); hasVal || (attrs = val); attrs || (attrs = {});
            return  cmn.extend(attrs, {
                get: function(model) {
                    return model.get(field);
                },
                set: function(model, value) {
                	attrs.nosetter || model.set(field, value);
                },
                val: function(model) {
                    var ok = 1;
                    var value = model.get(field).toString();
                    hasVal ? val.forEach(function(v){
                        ok = ok && (typeof v == 'function' ? v.call( model.control.field.data.form, model, value, field, attrs ) : typeof v == 'string' && model.required(field, v))
                    }) : model.required(field);
                }
            });
        },
        date: function(field, val, attrs) {
        	var hasVal = Array.isArray(val); hasVal || (attrs = val); attrs || (attrs = {});
            return  cmn.extend(attrs, {
            	formatting: 'MM/DD/YYYY',
                transform: '67890134',
                get: function(model) {
                    return model.get(field);
                },
                set: function(model, value) {
                	model.set(field, value);
                },
                val: function(model) {
                	var value = cmn.ARFtoDate(model.get(field));
                	value instanceof Date ? hasVal && val.forEach(function(v){
                        ok = ok && (typeof v == 'function' ? v.call( model.control.field.data.form, model, value, field, attrs ) : 1)
                    }) : model.error( hasVal && val[0] || 'Invalid format' ); 
                }
            });
        },
        choice: function(field, items, attrs){
            return cmn.extend(attrs, {
                get: function(model) {
                    return { value: model.get(field), items: items }
                },
                set: function(model, value) {
                    model.set(field, value);
                },
                val: function(model) {
                    model.required(field);
                },
                "default": []
            });
        },
        ajaxChoice: function(field, opts, attrs){
            return cmn.extend(attrs, {
                get: function(model) {
                    return opts.query ? cmn.ajaxFeed(model, cmn.extend(opts, { value: model(field) })) : cmn.ajaxFeed(model, { query: opts, value: model(field) })
                },
                set: function(model, value) {
                    model.set(field, value);
                },
                "default": []
            });
        },
        choiceItems: function(arg) {
            if(typeof arg == 'object') {
                var opts = [];
                for(var v in arg)
                    opts.push({value: arg[v], description: v});
                return opts;
            }
        }
    }
});