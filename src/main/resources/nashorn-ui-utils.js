define([], function() {
	var JavaCacheHandler = Java.type('com.arrow.util.nashorn.CacheHandler');
	var customStyles = new JavaCacheHandler();
	
	return {
		setDfeCustomStyle: function(style, name) {
			customStyles.set(name, style);
		},
		getAllCustomStyles: function(fields, styles) {
			styles = styles || {};
			fields.forEach(function(field) {
				var id = field.component._module && field.component._module.id, style = customStyles.get(id);
				typeof style === 'string' && (styles[id] = style);
			})
			return styles;
		}
	}
})