define(["ui/shapes", "ui/utils", "module", "ui/jquery", "dfe-common"], function(shapes, uiUtils, module, jQuery, cmn){
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

	    .dashboard-table th {
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
	let detailsCache = new Map();
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
			        })($$.get('.sortInverse').toString().split('.'), $$.get('.sortOrder').toString().split('.'))
		},
	    sortHeaderAtr: function($$, caption, field) {
    		return {
        		get: $$ => ({caption: caption, dir: $$.get('.sortInverse').indexOf(field) == -1 ? 'up' : 'down'}),
        		set: () => {
                    let si = $$.get('.sortInverse').toString(), so = $$.get('.sortOrder').toString();
                    $$.set('.sortInverse', si.indexOf(field) == -1 ? field + si : si.replace(field, ''));
                    $$.set('.sortOrder', field + so.replace(field, ''));
                } 
    		}
		},
		loadDetails: function(toLoad, loadNotes) {
			toLoad = toLoad.filter(px => {
				let existing = detailsCache.get( px.get('.quoteid') );
				return existing ? (px.set({...existing, detailsReady: 'Y'}), false) : true
			})
			for (let i = 0, j = toLoad.length, chunk = 20; i < j; i += chunk) {
				let sub = toLoad.slice(i, i + chunk), qs = sub.map(row => 'quoteId=' + row.get('.quoteid')).join('&');
				jQuery.get(`/AJAXServlet.srv?method=DashboardScriptHelper&action=details&${qs}`, data => {
					sub.forEach(px => {
						let quoteId = px.get('.quoteid'), details = data.result[quoteId];
						detailsCache.set(quoteId, details)
						px.set({...details, detailsReady: 'Y'});
					})
				});
				loadNotes && jQuery.get(`/AJAXServlet.srv?method=DashboardScriptHelper&action=notes&${qs}`, data => {
					sub.forEach(r => {
						let det = data.result[r.get('.quoteid')];
						det && det.forEach(note => r.append('.note', note));
					});
				});
			}
		}
	}	
})