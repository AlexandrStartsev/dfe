
var jsonModel = JSON.stringify(require('model'));
var formClass =  require('forms/testform');

for(var i = 0; i < 100; i++) {
	console.time('SSR took');
	ssr( jsonModel, formClass, 10, true );
	console.timeEnd('SSR took');
}