(function () {
	var runtime, node, ajaxKeys = new Set(), ajaxPrime = []; 
	EventLoop.run(function() {
		ajaxCache.setCallback(function(key){
			if(!ajaxKeys.has(key)) {
				ajaxKeys.add(key);
				ajaxCache.get(key).then(function(payload){ ajaxPrime.push({key: key, payload: payload}) });
			}
		})
		require(['dfe-core', 'dfe-dom', 'model', 'forms/testform'], function(Core, DOM, model, form){
			node = DOM.createElement('span');
			runtime = Core.startRuntime({ model : model, node: node, form: form });
		})
	}, 10000, undefined, function() { return !EventLoop.hasPendingNonTimerEvents() });
	console.log('<script>' + ajaxPrime.map(function(o) { return 'ajaxCache.putResolved("' + o.key + '", ' + JSON.stringify(o.payload) + ')' } ).join(";\n") + '</script>');
	console.log(node.serialize([]).join(''));
})()

//console.log('abc1');
/*var url = 'https://arrowheadexchange.com/AJAXServlet.srv?method=CMAUVehicleScriptHelper&action=getValuationMethodOptions&vehicleType=car';
var xhr = new XMLHttpRequest();
xhr.open("GET", url);
xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
    	console.log(this.responseText);
    }
};
xhr.send(null);
	setInterval(function() {console.log('abc')}, 50);
*/

//var errors = [], runtime = new Core.Runtime(listener()).setDfeForm(formClass).setModel(JSON.parse(jsonModel));
//var failure = EventLoop.run(function() { runtime.restart(null, 'validate', 5) }, timeLimit*1000, undefined, function() { return !(runtime.shouldAnythingRender || EventLoop.hasPendingNonTimerEvents()) });