var __STATIC_ROOT__ = 'classpath:nodejs/';
var __EVENTLOOP_DEBUG_MODE__ = true;
load('classpath:nashorn-utils.js');

var $ = jQuery = function() { return jQuery; }
jQuery.__noSuchProperty__ = jQuery;
jQuery.__noSuchMethod__ = jQuery;

//var done = false;

EventLoop(function(context) {
	
	// Require needs to be called within eventloop as it uses webpack lazy loading based on promises
	
	var service = require("./listener.js").default;
	
	/*
	var IOUtils = Java.type('org.apache.commons.io.IOUtils');
	var Thread = Java.type('java.lang.Thread');
	var model = JSON.parse(IOUtils.toString(Thread.currentThread().getContextClassLoader().getResourceAsStream("model.json"), "UTF-8"));
	var cars = JSON.parse(IOUtils.toString(Thread.currentThread().getContextClassLoader().getResourceAsStream("100cars.json"), "UTF-8"));
	service.ssr("quote.cmau.car", cars, console.log);
	return ;*/
	
	context.nonBlockingFeeder(function() { return queue.take(); }, function(payload) {
		service.validate(payload.formName, JSON.parse(payload.model), function(result) {
			payload.callback.complete(JSON.stringify(result));
		});
	});
	
}, 'https://arrowheadexchange.com', __httpClient);
