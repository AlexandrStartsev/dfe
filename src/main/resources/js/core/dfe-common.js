define(['exports'], function(exports) {
    function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
	//#################################################################################################################
	
	function yyyymmdd(dt, j) {
		typeof dt == 'number' && dt && (dt = new Date(dt));
	    var mm = dt.getMonth() + 1, dd = dt.getDate();
	    return [dt.getFullYear(),(mm>9 ? '' : '0') + mm,(dd>9 ? '' : '0') + dd].join(j||'');
	}
	
	function mmddyyyy(dt, j) {
		typeof dt == 'number' && dt && (dt = new Date(dt));
	    var mm = dt.getMonth() + 1, dd = dt.getDate();
	    return [(mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd, dt.getFullYear()].join(j||'');
	}
	
	function ARFtoDate(ad) { 
		ad = ((Array.isArray(ad) ? ad[0] : ad)||'').toString();
	    var dt = new Date(ad.substr(0, 4),ad.substr(4, 2)-1,ad.substr(6, 2)); 
	    return dt instanceof Date && yyyymmdd(dt) == ad ? dt : 'Invalid Date';
	}
	function today(days) { return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + (days || 0)); }

    var arfDatePattern = '^(18|19|20)((\\d\\d(((0[1-9]|1[012])(0[1-9]|1[0-9]|2[0-8]))|((0[13578]|1[02])(29|30|31))|((0[4,6,9]|11)(29|30))))|(([02468][048]|[13579][26])0229))$';
	var statesPattern = 'AK|AL|AR|AZ|CA|CO|CT|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY';
	var statesPatternType = (function(){ var ss = new Set(); statesPattern.split('|').forEach(function(s) {ss.add(s.charAt(0))}); return Array.from(ss).join('|') + '|' + statesPattern})();
	//#################################################################################################################
	
	function _test(a, b) { if(a == 0) return b == 0; if(typeof a != 'object') return a == b; for(var i in a) if(a[i] != b[i]) return false; return true; }
	function ajaxFeed($$, args) {
	    var o = _extend(args, {test: _test, mapper : function(i) {return i}}), r = { value : (Array.isArray(o.value) ? o.value[0] : o.value)||0, items : [], status: 'loading'}, p;
	    function onSuccess(data){
        	try {
        		r.status = 'error';
	            var d = data && data.result;
		        o['default'] && (d = [o['default']].concat(d));
		        (r.status = data.status == 'success') && Array.isArray(d) && d.forEach( function(i) { 
		        	r.items.push(i = o.mapper(i));
		        	i.value = i.value || _extend(i, {});
		        	r.found = r.found || o.test(r.value, i.value) && i.value; 
		        });
		        r.found || o.noerror || !$$.$node.doValidation ? $$.result(r) : $$.error(r.items.length > 0 ? 'Please make selection' : 'Not found', r);
        	} catch (e) {
        		$$.error(e.message, r);
        	}
        }
	    function onFailure(fail){
        	try {
	        	r.status = 'error';
	            if($$.$node.doValidation && !o.noerror) {
	                var msg = 'Error retrieving data\n' + (fail.exception ? fail.exception.message : fail.xhr.statusText);
	                fail.xhr.responseText && (msg = fail.xhr.responseText.substr(0, 50) + '...');
	                $$.error(msg, r);
	            } else
	                $$.result(r)
        	} catch (e) {
        		$$.error(e.message, r);
        	}
        }
	    // normally you just put p.then but IE will render page before resolved promise calls back. Or maybe I should just modify promise polyfill...
	    p = ajaxCache.get(o.query);
	    if(!p.done) {
	    	p.then(onSuccess, onFailure);
	    	return r;
	    } else {
	    	(p.done==1?onSuccess:onFailure)(p.result);
	    }
        //if(!p.done) return r; // no need to repeat rendering if promise was resolved
	}
	//###########################################################################################################
	_extend({ yyyymmdd: yyyymmdd,
		    mmddyyyy: mmddyyyy,
			ARFtoDate: ARFtoDate,
			today: today,
			arfDatePattern: arfDatePattern,
			arfDateRegExp: new RegExp(arfDatePattern),
			statesPattern: statesPattern,
			statesPatternType: statesPatternType,
			ajaxFeed: ajaxFeed,
            extend: _extend },
	exports);
});