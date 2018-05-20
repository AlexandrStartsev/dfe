
var jsonModel = JSON.stringify(require('model'));
var formClass =  require('forms/testform');

for(var i = 0; i < 1000; i++) {
	console.time('SSR took');
	ssr( jsonModel, formClass, 10000, true );
	console.timeEnd('SSR took');
}