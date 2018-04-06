defineForm("dashboard/sortableheader", [ "ui/utils", "ui/shapes", "components/html", "components/label", "components/div", "module" ], function(uiUtils, shapes, __c_html, __c_label, __c_div, module) {
    return new class {
        constructor() {
            this.dfe = __c_div("a", {
                get: $$ => [ $$ ]
            }, [ __c_label("b", {
                get: $$ => $$('caption')
            }), __c_html("c", {
                atr: $$ => ({
    	            class: 'arrow-button',
    	            get: $$ => shapes.svgShape($$, 'svg-arrow-' + $$('dir')),
    	            events: {
    	                click: () => this.store($$)
    	            }
    	        })
            }) ])
        }
        setup() {
        	uiUtils.setDfeCustomStyle(`
    		    .arrow-button {
    		        width:14px;
    		        height: 14px;
    		        fill: white;
    		        display: flex;
    		    }
    		
    		    .arrow-button:active {
    		        transform: scale(0.8);
    		    }    
    	    `, module.id);
        }
    }
})
            