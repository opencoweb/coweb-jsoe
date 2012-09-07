
var requirejs = require("requirejs");

requirejs.config({
    nodeRequire: require,
    baseUrl: __dirname
});

requirejs(["coweb/jsoe/OTEngine"], function(OTEngine) {
    exports.OTEngine = OTEngine;
});

