define('dfe-field-helper', ['dfe-common'], function(cmn) {
	return {
        simple: function(field, val, attrs) {
            return  cmn.extend(Array.isArray(val) ? attrs : val, {
                get: function(model) {
                    return model.get(field);
                },
                set: function(model, value) {
                    model.set(field, value);
                },
                val: function(model) {
                    var ok = 1;
                    Array.isArray(val) ? val.forEach(function(v){
                        ok = ok && (typeof v == 'string' ? model.required(field, v) : model.required(field, v[0], v[1]))
                    }) : model.required(field);
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
                    return opts.query ? cmn.ajaxFeed(model, cmn.extend(opts, { param: { value: model(field) }, name: 'value' })) :
                        cmn.ajaxFeed(model, { query: opts, param: { value: model(field) }, name: 'value' })
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