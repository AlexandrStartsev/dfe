define(['ui/utils', 'module'], function(uiUtils, m){
	var body = document.body || document.getElementsByTagName('body')[0], dest = body.appendChild(document.createElement('div'));
	dest.setAttribute('style', 'display: none');
	function loadHtml(src, cb) {
		var body = document.body || document.getElementsByTagName('body')[0];
	    var head = document.head || document.getElementsByTagName('head')[0];
		var iframe = body.appendChild(document.createElement('iframe'));
	    iframe.src = src;
	    iframe.setAttribute('style', 'display: none');
	    iframe.addEventListener('load', function() {
	        var doc = iframe.contentWindow.document;
	        for(var n = doc.querySelectorAll('style'), i = n.length; i; head.appendChild(n[--i]) );
	        for(var n = doc.querySelectorAll('[id]'), i = n.length; i; dest.appendChild(n[--i]));
	        body.removeChild(iframe);
	        cb();
	    })
	}
	var map = new Map(), root = m.uri.replace(m.id+'.js',''), cloneSvg = +window.navigator.userAgent.replace(/^.+Firefox\/(\d+)/,'$1') < 56;

	return {	load : function(source) {
					source = source||'ui/shapes';
					var load = map.get(source);
					load || map.set(source, load = new Promise(function(resolve, reject){ loadHtml(root + source + '.html', resolve) }));
					return load;
				},
				cssShape: function($$, id, source) {
					var e = document.getElementById(id);
					if(e) {
						(e = e.cloneNode(true)).removeAttribute('id');
						return e;
					} else {
						this.load(source).then(function() {
							(e = document.getElementById(id).cloneNode(true)).removeAttribute('id');
							$$.result(e);
						})
					}
				},
				svgShape: function($$, id, source) {
					if(cloneSvg)
						return this.cssShape($$, id, source);
					var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), use = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'use'));
                    use.setAttribute('href', '#' + id);
                    this.load(source);
                    return svg;

				}
	       }
})
