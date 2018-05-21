/** 
  Alexandr Startsev @ 5/19/2018
  this is used by both client and server (on server size is limited and lifespan is set for a certain duration).
  this is also used to prime ajax cache on client side after server side rendering, so ajax-driven controls don't flicker while data is loaded.
  server will generate script with series of "ajaxCache.putResolved" calls that should be executed before dfe runtime renders form for the first time. 
  calling ajaxCache.setCallback on server side allows to spy on which keys will be necessary to render form. 
  
  even primed, processing fetched values through Promise.then causes browser to refresh control with empty data, so done/result was added as a shortcut.
*/

define(function() {
	var hook = typeof JavaThreadLocal !== 'undefined' ? new JavaThreadLocal() : { set: function(cb) { this.callback = cb; }, get: function() {return this.callback} };
    var storage = typeof JavaCacheHandler !== 'undefined' ? JavaCacheHandler.sharedCache('ajaxCache', '1000', '10') : new Map();
    var extend = function(from, to) {for (var key in from) to[key] = from[key]; return to; }
    return {
    	setCallback: function(callback) {
    		hook.set(callback);
    	},
        clear: function() {
            storage.clear();
        },
        get: function(opt) {
        	var base = '/AJAXServlet.srv?';
            if(typeof opt != 'string' && !opt.url) { // method: ... action: ...
                var u = base;
                for(var o in opt)
                    (Array.isArray(opt[o])?opt[o]:[opt[o]]).forEach(function(v){
                        u += encodeURIComponent(o) + '=' + encodeURIComponent(typeof v == 'object' ? JSON.stringify(v) : v) + '&';
                    })
                opt = u.replace(/\&$/,'');
            }
            var url = typeof opt == 'string' ? opt : opt.url, key = url.replace(base, ''), cb = hook.get(), promise;
            if(storage.has(key)) {
            	promise = storage.get(key);
            } else {
                var  xhr = new XMLHttpRequest(), dataType = opt.dataType || 'json', so = typeof opt.data == 'object';
                var hrds = extend(opt.headers, {'Content-Type' : so ? 'application/json' : 'application/x-www-form-urlencoded'});
                storage.set(key, promise = new Promise(function(resolve, reject){
                    xhr.open(opt.type || 'GET', so ? url : url + '&cacheKey=' + encodeURIComponent(key));
                    for(var i in hrds) xhr.setRequestHeader(i, hrds[i]);
                    dataType == 'json' && xhr.setRequestHeader('Accept', 'application/json');
                    xhr.onreadystatechange = function() {
                        if(this.readyState === 4) {
                            promise.done = 1;
                            if(this.status == 200)
                                try {
                                	var r = this.response || this.responseText;
                                    resolve(promise.result = typeof r == 'string' && dataType == 'json' ? JSON.parse(r) : r)
                                } catch(e) {
                                	promise.done = 2;
                                    reject(promise.result = {xhr: xhr, exception: e});
                                }
                            else {
                            	promise.done = 2;
                                reject(promise.result = {xhr: xhr});
                            }
                        }
                    }
                    xhr.send(so ? extend(opt.data, {cacheKey: key}) : opt.data);
                }));
            }
            typeof cb === 'function' && cb(key, promise);
            return promise;
        },
        put: function(key, responseString, dataType, statusString, ex) {
        	var ok = false, v, result;
            statusString = statusString||'success';
            try {
            	if( statusString == 'success' ) {
            		result = dataType == 'json' ? JSON.parse(responseString) : responseString;
            		ok = true;
    			} else {
    				result = {xhr: {statusText: statusString, responseText : responseString}, exception: ex}
    			}
    		} catch(e) { 
    			result = {xhr: {statusText: statusString, responseText : responseString}, exception: e}; 
    		}
            this[ok ? 'putResolved' : 'putRejected'](key, result);
        },
        putResolved: function(key, result) {
            var v = Promise.resolve(result);
            v.done = 1;
            v.result = result;
            storage.set(key, v);
        },
        putRejected: function(key, error) {
            var v = Promise.reject(error);
            v.done = 2;
            v.result = result;
            storage.set(key, v);
        }
    }
})