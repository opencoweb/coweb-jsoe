
var fs = require("fs");

/**
 * A LocalServerConnection uses the file system to communicate with different
 * remote peers. Clients connect to a "directory;" a LocalServerConnection
 * uses two global files in each directory: "order" and "lock." The order file
 * contains a single integer that is used to increment a counter used for a
 * total order counter. The lock file is used as a global lock so that only
 * one LocalServerConnection per directory connection can perform operations.
 *
 * The locking technique is as a coarse grained as possible, but it ensures
 * correctness at minimal development cost.
 *
 * Peers are allocated a single file in the connected directory - the filename
 * is the integer site Id of the peer. Each engine syncs and operations are
 * stored in a single line in each file. When a peer sends out messages, it
 * reads all files in the directory (excluding the order and lock files) and
 * writes data to each file. Peers periodically scan the files for changes
 * and through callbacks notify the underlying peer about syncs and remote
 * operations.
 */

var LocalServerConnection = function(path, engineCb, opCb) {
	this._path = path;

	this._lock();
	this._init();
	this._unlock();

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

/**
 * Ok, I'll admit the whole "big kernel lock" approach is lame and negatively
 * impacts performance. But, its easy to implement, and having a global lock
 * is preferable to not having one at all. Plus, this is just an example...not
 * production code.
 *
 * JavaScript doesn't have RAII or any nice mechanism to automatcally release
 * resources, so each time I acquire a mutex I have to try/catch the entire
 * critical section.
 *
 * The way the lock works is we open a file with flags "wx" to obtain the lock,
 * and to release we close the file descriptor and remove the file.
 */
proto._lock = function() {
	/* I know...how aweful...its basically a spin lock. I guess I could try an
	   asynchronous approach...but this will do for now. */
	while (1) {
		try {
			this._lockfd = fs.openSync(this._path + "/lock", "wx");
		} catch (e) {
			continue;
		}
		return;
	}
};

proto._unlock = function() {
	fs.closeSync(this._lockfd);
	fs.unlinkSync(this._path + "/lock");
};

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
	this._lock();
	try {
		var contents = fs.readFileSync(this._localFile).toString();
		/* Clear out file. */
		fs.closeSync(fs.openSync(this._localFile, "w"));

		if (0 === contents.length) {
			this._unlock();
			return;
		}
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
	} catch (e) {
		this._unlock();
		throw e;
	}
	this._unlock();
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
	this._lock();
	try {
		for (var f in remotes) {
			var at = remotes[f];
			fs.appendFileSync(this._path + "/" + remotes[f], toWrite);
		}
	} catch (e) {
		this._unlock();
		throw e;
	}
	this._unlock();
};

proto.sendEngineSync = function(json) {
	/* We must write a single line, so lets escape newlines, etc. */
	json = {
		type: "engine",
		from: this._siteId,
		json: json
	};
	var toWrite = escape(JSON.stringify(json)) + "\n";
	this._lock();
	try {
		var remotes = this._getRemotes();
		for (var f in remotes) {
			var at = remotes[f];
			fs.appendFileSync(this._path + "/" + remotes[f], toWrite);
		}
	} catch (e) {
		this._unlock();
		throw e;
	}
	this._unlock();
};

proto._incTotalOrder = function() {
	var order = parseInt(fs.readFileSync(this._path + "/order").toString());
	fs.writeFileSync(this._path + "/order", "" + (order + 1));
	return order;
};

proto.getSiteId = function() {
	return this._siteId;
}

proto.exit = function() {
	this._lock();
	try {
		fs.unlinkSync(this._localFile);
		/* Clean up global order file if we are the last client. */
		if (0 === this._getRemotes().length)
			fs.unlinkSync(this._path + "/order");
	} catch (e) {
		this._unlock();
		throw e;
	}
	this._unlock();
};

exports.LocalServerConnection = LocalServerConnection;

