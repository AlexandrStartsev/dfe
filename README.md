# nashorn-polyfill

# EventLoop
Guarantees to run all user code in single thread, whether it s triggered by promise, http call, or timer, thus addressing thread safety concern. 
Multiple java threads can share same global as long as they don't create any new global variables.

Event loop will run as long as there are scheduled events to handle (such as http call with "onreadystatechange" handler set -- if handler is not set, event loop will not consider this as a potential "event" even in underlying thread is still running)

Ability to terminate event loop at will (current event will finish), return value from event loop. 

Some basic troubleshooting mechanisms, such as ability to review pending events (including stack trace of their creation). 

Implementation uses simple concurrent queue that is only read by event loop main thread. Other threads push new events in a queue as they become due. 

# setTimeout/setInterval/setImmediate  
Use timer to schedule events. Provided function will be executed as requested, in a same thread that called set*** (event loop thread), providing thread safety.  

# XMLHttpRequest  
Provides basic functionality to mimic browser. Uses synchronous HttpClient running in separate thread. As soon as result is obtained, pushes "onreadystatechange" handlers into event loop queue. Handlers are thread safe and can modify any variables created within event loop. 

# Promise
Simple implementation based on CompletableFuture. Not the fastest, but guarantees thread safety. Both promise handler (new Promise(function() {...}) and code passed to "then" are guaranteed to be executed in event loop main thread, maintaining thread safety.  

# require/define (amd)
Not finished. Provides basic config functionality. Asyncronous. Callbacks are guaranteed to run withing the thread that initiated require/define, but due to shared nature, define may expose event loop closure to other threads that "require" module defined within event loop. It s probably a bad idea to do something like that anyway. 

# es6 Map/Set
Map and Set implementation to mimic es6 map and set. Comply with basic requirements, such as visiting newly added values during forEach loop.

#
p.s. 
"react" module is provided to mimic react rendering (to an extent). once root element is rendered, it's children are being traversed and validated asynchronously, including ajax-based validation. Since event loop will wait until there are no more events scheduled, validation result can be collected and returned from loop right after it s ready. There are no other differences vs client side except for re-implemented React.createElement and ReactDOM.render. Supports basic lifecycles (very very basic...) such as reconciliation/re-rendering upon state change.  
