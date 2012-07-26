
/**
 * NodeJS does not support CommonJS Asynchronous Module Definitions, but the
 * operation engine API is built using AMDs. In order to use the OT API with
 * NodeJS, we must use the requirejs module.
 *
 * We set `define' in the global namespace to requirejs's define function so
 * that the OT API code can use it.
 *
 */
var requirejs = require("requirejs");
var define = requirejs.define;

requirejs.config({
	nodeRequire : require,
	baseUrl : "../",
	paths : {
		"coweb/jsoe" : "./"
	}
});

requirejs([
	"OTEngine"
], function(OTEngine) {
	var ot = new OTEngine(0);
	console.log(ot.createOp("topic", 1,2,3));
	/* If we get here, then everything worked correctly. */
});

