define(['dfe-common'], function(cmn) {
	return {
        simple: function(field, val, attrs) {
            let hasVal = Array.isArray(val); hasVal || (attrs = val); attrs || (attrs = {});
            return {
                get: model => model.get(field),
                set: (model, value) => model.set(field, value),
                val: model => hasVal ? !val.some(func => func.call(model.$node.form, model, model.get(field).toString(), field, attrs) === false) : model.required(field),
                ...attrs
            }
        },
        date: function(field, val, attrs) {
        	var hasVal = Array.isArray(val); hasVal || (attrs = val); attrs || (attrs = {});
            return  {
            	format: 'MM/DD/YYYY',
                transform: '67890134',
                get: model => model.get(field),
                set: (model, value) => model.set(field, value),
                val: function(model) {
                	let value = cmn.ARFtoDate(model.get(field));
                    return value instanceof Date ? !(hasVal && val.some(func => func.call(model.$node.form, model, value, field, attrs) === false)) :  model.error( hasVal ? val[0] : 'Invalid format' ) 
                },
                ...attrs
            };
        },
        choice: function(field, items, attrs){
            return {
                get: model => ({ value: model.get(field), items: items }),
                set: (model, value) => model.set(field, value),
                val: model => model.required(field),
                "default": [],
                ...attrs
            }
        },
        ajaxChoice: function(field, opts, attrs){
            return {
                get: model => opts.query ? cmn.ajaxFeed(model, cmn.extend(opts, { value: model(field) })) : cmn.ajaxFeed(model, { query: opts, value: model(field) }),
                set: (model, value) => model.set(field, value),
                "default": [],
                ...attrs
            }
        },
        choiceItems: arg => typeof arg === 'object' ? Object.getOwnPropertyNames(arg).map(key => ({value: arg[key], description: key})) : []
    }
});