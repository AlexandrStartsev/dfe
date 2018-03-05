define('dfe-common', ['exports'], function(exports) {
	function _extend(from, to) { for (var key in from) to[key] = from[key]; return to; }
	//#################################################################################################################
	
	function yyyymmdd(dt) {
	  var mm = dt.getMonth() + 1, dd = dt.getDate();
	  return [dt.getFullYear(),(mm>9 ? '' : '0') + mm,(dd>9 ? '' : '0') + dd].join('');
	}
	
	function ARFtoDate(ad) { 
		ad = (Array.isArray(ad) ? ad[0] : ad).toString();
	    var dt = new Date(ad.substr(0, 4),ad.substr(4, 2)-1,ad.substr(6, 2)); 
	    return dt instanceof Date && yyyymmdd(dt) == ad ? dt : 'Invalid Date';
	}
	function today(days) { return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + (days || 0)); }

    var arfDatePattern = '^(18|19|20)((\d\d(((0[1-9]|1[012])(0[1-9]|1[0-9]|2[0-8]))|((0[13578]|1[02])(29|30|31))|((0[4,6,9]|11)(29|30))))|(([02468][048]|[13579][26])0229))$';
	var statesPattern = 'AK|AL|AR|AZ|CA|CO|CT|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY';
	var statesPatternType = (function(){ var ss = new Set(); statesPattern.split('|').forEach(function(s) {ss.add(s.charAt(0))}); return Array.from(ss).join('|') + '|' + statesPattern})();
	//#################################################################################################################
	
    function __test(n, i, p){ if(n) return i[n]==p[n]; for(var v in p) if(i[v]!=p[v]) return; return true; }
	function ajaxFeed($$, args) {
	    var o = _extend(args, {mapper : function(i) {return i}}), r = { value : ( o.name ? o.param[o.name] : o.param), items : []}, p;
        (p = ajaxCache.get(o.query)).then(function(data){
            var d = data.result;
	        o['default'] && (d = [o['default']].concat(d));
	        data.status == 'success' && Array.isArray(d) && d.forEach( function(i) { r.items.push(i=o.mapper(i)); r.found||__test(o.name, i, o.param)&&(r.found=(o.name ? i[o.name] : i)) });
	        if(r.found || o.noerror || !$$.control.doVal)    // $$.runtime.removeErroring($$.control) --delete $$.control.error; do we need this? 
	            $$.result(r); 
            else 
                $$.error(r.items.length > 0 ? 'Please make selection' : 'Not found', r)
        }, function(fail){
            if($$.control.doVal && !o.noerror) {
                var msg = 'Error retrieving data\n' + (fail.exception ? fail.exception.message : fail.xhr.statusText);
                fail.xhr.responseText && (msg += '\n' + fail.xhr.responseText.substr(0, 200));
                $$.error(msg, r);
            } else
                $$.result(r)
        })
        if(!p.done) return r; // no need to repeat rendering if promise was resolved
	}
	//###########################################################################################################
	_extend({ yyyymmdd: yyyymmdd,
			ARFtoDate: ARFtoDate,
			today: today,
			arfDatePattern: arfDatePattern,
			statesPattern: statesPattern,
			statesPatternType: statesPatternType,
			ajaxFeed: ajaxFeed,
            extend: _extend },
	exports);
});