
var fs = require("fs");

var LocalServerConnection = function(path, engineCb, opCb) {
	this._path = path;

	this._init();

	this._engineCb = engineCb;
	this._opCb = opCb;

	/* First, get unique site Id. */
	var files = fs.readdirSync(this._path);
	this._siteId = files.length;
	this._localFile = this._path + "/" + this._siteId;
	var fd = fs.openSync(this._localFile, "w");
	fs.closeSync(fd);

	setInterval(this._fireRead.bind(this), 500);
};
proto = LocalServerConnection.prototype;

proto._init = function() {
	var fd;
	try {
		fd = fs.openSync(this._path + "/order", "r");
	} catch (e) {
		fs.writeFileSync(this._path + "/order", "0");
		return;
	}
	fs.closeSync(fd);
};

proto._fireRead = function() {
	var contents = fs.readFileSync(this._localFile).toString();
	/* Clear out file. */
	fs.closeSync(fs.openSync(this._localFile, "w"));

	if (0 === contents.length)
		return;
	contents = contents.split("\n");
	for (var i in contents) {

		if (0 === contents[i].length)
			continue;
		var obj = JSON.parse(unescape(contents[i]));
		if ("op" === obj.type) {
			this._opCb(obj.order, obj.json)
		} else if ("engine" === obj.type) {
			this._engineCb(obj.from, obj.json);
		}
	}
};

proto._getRemotes = function() {
	var files = fs.readdirSync(this._path);
	var idx = files.indexOf("" + this._siteId);
	files.splice(idx, 1);
	idx = files.indexOf("order");
	files.splice(idx, 1);
	return files;
};

proto.sendOp = function(json) {
	/* We must write a single line, so lets escape newlines, etc. */
	json = {
		type: "op",
		order: this._incTotalOrder(),
		json: json
	};
	var toWrite = escape(JSON.stringify(json)) + "\n";
	var remotes = this._getRemotes();
	for (var f in remotes) {
		var at = remotes[f];
		fs.appendFileSync(this._path + "/" + remotes[f], toWrite);
	}
};

proto.sendEngineSync = function(json) {
	/* We must write a single line, so lets escape newlines, etc. */
	json = {
		type: "engine",
		from: this._siteId,
		json: json
	};
	var toWrite = escape(JSON.stringify(json)) + "\n";
	var remotes = this._getRemotes();
	for (var f in remotes) {
		var at = remotes[f];
		fs.appendFileSync(this._path + "/" + remotes[f], toWrite);
	}
};

proto._incTotalOrder = function() {
	// TODO lock/flock
	var order = parseInt(fs.readFileSync(this._path + "/order").toString());
	fs.writeFileSync(this._path + "/order", "" + (order + 1));
	return order;
};

proto.getSiteId = function() {
	return this._siteId;
}

proto.exit = function() {
	fs.unlinkSync(this._localFile);
	/* Clean up global order file if we are the last client. */
	if (1 === this._getRemotes().length)
		fs.unlinkSync(this._path + "/order");
};

exports.LocalServerConnection = LocalServerConnection;

