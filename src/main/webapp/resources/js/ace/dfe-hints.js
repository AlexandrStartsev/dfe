/* 
 * @param {String} path 
 * @returns {String|Array|JsonProxy}
 */
$$_f = function (path) {
    return 'abc';
}

$$ = new dfe_core.JsonProxy();

$$.control = { notifications: [] };
$$.runtime = new core.DfeRuntime();

/* Feeds render function of a respective component;
 * @param value to be passed to render function
 */
$$.result = function (value) {};
$$.error = function (errorText) {};
$$.events = [{action: "a"}];

get($$), set($$, value), validate($$), attr($$)
//get($$_f), set($$_f, value), validate($$_f), attr($$_f)
