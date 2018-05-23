define([], function() {
	var customStyles = new Map();
	
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