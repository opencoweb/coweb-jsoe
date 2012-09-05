
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
var OTServer = require("./NodeOTServer.js");

requirejs.config({
	nodeRequire : require,
	baseUrl : "../../",
	paths : {
		"coweb/jsoe" : "./",
	}
});

var Processor = function(client, ot, data) {
	this._client = client;
	this._ot = ot;
	this._data = data;
};
var proto = Processor.prototype;

proto.help = function() {
	process.stdout.write("Usage: \n");
	process.stdout.write("  v view    list\n");
	process.stdout.write("  a <n> <v> add item to list at specified position\n");
	process.stdout.write("  d <n>     delete item\n");
	process.stdout.write("  u <n> <v> update specified item\n");
	process.stdout.write("  q         quit\n");
};

proto._inBounds = function(pos, inc) {
    if (inc)
        return 0 <= pos && pos <= this._data.length;
    else
        return 0 <= pos && pos < this._data.length;
};

proto.add = function(cmd, sendSync) {
	var idx = cmd.indexOf(" ");
	var pos = parseInt(cmd.substring(0, idx));
	var val = cmd.substring(idx + 1);
    if (!this._inBounds(pos, true)) {
        return -1;
    }
	this._data.splice(pos, 0, val);
	if (sendSync) {
		var op = this._ot.localEvent(
				this._ot.createOp("list", val, "insert", pos));
		this._client.sendOp(op);
	}
    return 0;
};

proto.delete = function(cmd, sendSync) {
    var pos = parseInt(cmd);
    if (!this._inBounds(pos, false)) {
        return -1;
    }
	this._data.splice(pos, 1);
	if (sendSync) {
		var op = this._ot.localEvent(
				this._ot.createOp("list", null, "delete", pos));
		this._client.sendOp(op);
	}
    return 0;
};

proto.update = function(cmd, sendSync) {
	var idx = cmd.indexOf(" ");
	var pos = parseInt(cmd.substring(0, idx));
	var val = cmd.substring(idx + 1);
    if (this._inBounds(pos, false)) {
        return -1;
    }
	this._data[pos] = cmd.substring(idx + 1);
	if (sendSync) {
		var op = this._ot.localEvent(
				this._ot.createOp("list", val, "update", pos));
		this._client.sendOp(op);
	}
    return 0;
};

proto.view = function() {
	process.stdout.write(this._data + "\n");
};

proto.input = function(str) {
	switch (str.charAt(0)) {
		case "h":
			this.help();
			break;
		case "a":
			if (this.add(str.substring(2), true))
                process.stdout.write("Invalid index");
			break;
		case "d":
			if (this.delete(str.substring(2), true))
                process.stdout.write("Invalid index");
			break;
		case "u":
			if (this.update(str.substring(2), true))
                process.stdout.write("Invalid index");
			break;
		case "v":
			this.view();
			break;
		case "q":
			process.exit(0);
			break;
		default:
			process.stdout.write("Invalid option...");
			break;
	}
	process.stdout.write("\n");
	this.ioLoop();
};

proto.ioLoop = function() {
	process.stdout.write("Enter an option (h for help:): ");
};

requirejs([
	"OTEngine",
], function(OTEngine) {
	function apply(op) {
	}

	function engineCb(from, syncs) {
		ot.syncInbound(from, syncs);
	}
	function opCb(order, op) {
		op = ot.remoteEvent(order, op);
		switch (op.type) {
			case "insert":
				processor.add(op.position + " " + op.value);
				break;
			case "delete":
				processor.delete(op.position);
				break;
			case "update":
				processor.update(op.position + " " + op.value);
				break;
		}
	}

	var srvPath = process.argv[2];
	if (!srvPath) {
		process.stdout.write("Usage: node NodeClient.js <shared data directory>\n");
		process.exit(1);
	}

	var client = new OTServer.LocalServerConnection(
			srvPath, engineCb, opCb);
	var ot = new OTEngine(client.getSiteId());

	setInterval(function() {
		ot.purge();
	}, 10 * 1000);
	setInterval(function() {
		client.sendEngineSync(ot.syncOutbound());
	}, 10 * 1000);

	process.on("exit", function() {
		client.exit();
	});
	process.on("SIGINT", function() {
		/* This will trigger the exit event. Without capturing SIGINT, we would
		   never capture an exit event. */
		process.exit(0);
	});

	var processor = new Processor(client, ot, []);

	var stdin = process.stdin;
	var stdio = process.stdio;

	stdin.resume();
	stdin.setEncoding("utf-8");
	stdin.on("data", function(chunk) {
		processor.input(chunk.substring(0, chunk.length - 1));
	});

	processor.ioLoop();

});

