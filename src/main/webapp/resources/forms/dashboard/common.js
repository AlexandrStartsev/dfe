define(["ui/shapes", "ui/utils", "module", "ui/jquery", "dfe-common"], function(shapes, uiUtils, module, jq, cmn){
	uiUtils.setDfeCustomStyle(`
    	.loading-overlay {
    		align-content: center;
    		position: absolute;
    		width: 100%;
    		height: 100%;
    		min-height: 200px;
    		min-width: 200px;
    		background: lightgray;
    		opacity: 0.3;
    		z-index: 100;
    	}
    	
	    .dashboard-table th {
	        background-color: #97a47a;
	        border-right: solid 1px white;
	        white-space: nowrap;
	    }

	    .dashboard-table th label {
	        color: white;
	        outline: none;
	        white-space: nowrap;
	    }

	    .dashboard-table {
	        border-collapse: collapse;
	    }   
	    
	    .wrong-date {
	        background: antiquewhite;
	    }	    
    `, module.id);
	return {
		makeSortFunction: function($$) {
			return (function(si, so) { 
			        	return (row1, row2) => {
			                for (let i = 1; i < so.length; i++) {
			                    let l = row1.get('.' + so[i]).toString(), r = row2.get('.' + so[i]).toString();
			                    let j = so[i] == 'writtenPremium' ? +l - +r : l.localeCompare(r);
			                    if (j != 0) return -j * si.indexOf(so[i]);
			                }
			                return 0;
			        	}
			        })($$('.sortInverse').toString().split('.'), $$('.sortOrder').toString().split('.'))
		},
	    sortHeaderAtr: function($$, caption, field) {
    		return {
        		get: $$ => ({caption: caption, dir: $$('.sortInverse').indexOf(field) == -1 ? 'up' : 'down'}),
        		set: () => {
                    let si = $$.get('.sortInverse').toString(), so = $$.get('.sortOrder').toString();
                    $$.set('.sortInverse', si.indexOf(field) == -1 ? field + si : si.replace(field, ''));
                    $$.set('.sortOrder', field + so.replace(field, ''));
                } 
    		}
    	}
	}	
})