
var requirejs = require("requirejs");

requirejs.config({
    nodeRequire: require,
    baseUrl: __dirname,
    paths: {
        "coweb/jsoe" : "./"
    }
});

requirejs(["OTEngine"], function(OTEngine) {
    exports.OTEngine = OTEngine;
});

