var __STATIC_ROOT__ = 'classpath:';
var __EVENTLOOP_DEBUG_MODE__ = true;
load('classpath:nashorn-utils2.js');

var $ = jQuery = function() { return jQuery; }
jQuery.__noSuchProperty__ = jQuery;
jQuery.__noSuchMethod__ = jQuery;

//var done = false;

EventLoop(function(context) {
	/*new Promise(function (resolve, reject) {
		resolve("ABC");
	}).then(function(a) { return "A" + a}).then(console.log, console.log);
	return ;
	*/
	
	console.time("1");
	console.time("2");
	console.time("3");
	var service = require("./listener.js").default;
	var classes = require("./classes.js").default;
	var cars = require("./100cars.js").default;
	
	var x = 0;
	//service.ssr("corecomm/quote.work.class", classes, console.log);
	//return ;
	
	/*var bp;
	setImmediate(function() {
		bp = context.setBreakpoint();
		service.ssr("corecomm/quote.cmau.car", cars, console.log);
	});
	*/
	context.nonBlockingFeeder(function() { return queue.take(); }, console.log);
	/*
	setTimeout(function() {
		context.cancelTaskTree(bp);
		setTimeout(function() { service.validate("corecomm/quote.cmau.car", cars, console.log) }, 3000);
		setTimeout(function() { service.validate("corecomm/quote.cmau.car", cars, console.log) }, 6000);
					
	}, 6000);
	//benchmark();
	
	//service.ssr("corecomm/quote.work.class", classes, console.log);
	
	function benchmark() {
		var x;
		function Do(x) {
			if(x < 10000) {
				console.time("" + x);
				service.validate("corecomm/quote.cmau.car", cars, setImmediate.bind(null, function() {
					console.timeEnd("" + x);
					Do(x + 1);
				}));
			}
		}
		Do(0);
	}*/
	
}, 'https://arrowheadexchange.com', __httpClient);

/*
EventLoop.run(function() {
	console.time("123");
	console.time("12345");
	var service = require("./listener.js").default;
	var classes = require("./classes.js").default;
	var cars = require("./100cars.js").default;
	console.log("Do...");
	*/
	/*setImmediate(function() {
		var task = setImmediate(function() {
			service.validate("corecomm/quote.cmau.car", cars, function(e) {
				console.warn(e);
				console.timeEnd("123");
			});
		});
		setTimeout(function() {
			console.warn("attempting to cancel taskId = " + task.id);
			EventLoop.cancelTask(task);
			console.warn("done");
			service.validate("corecomm/quote.cmau.car", cars, function(e) {
				console.warn(e);
				console.timeEnd("12345");
			});
		}, 6000);
	});*/
	
	//service.ssr("corecomm/quote.cmau.car", cars, console.log);
	//service.ssr("corecomm/quote.work.class", classes, console.log);
	//service.validate("corecomm/quote.work.class", classes, console.log);
	
	/*var i = 0;
	setInterval(function() {
		var id = 'duration' + (++i);
		console.time(id);
		service.validate("corecomm/quote.cmau.car", cars, function(e) {
			//console.log(e);
			console.timeEnd(id);
		});
	}, 500);*/
//}, __httpClient);

