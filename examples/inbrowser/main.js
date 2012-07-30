
require([
	"dojo",
	"dojo/_base/array",
	"dojo/_base/xhr",
	"coweb/jsoe/OTEngine",
	"dojo/dom"
], function(dojo, array, xhr, OTEngine, dom) {

	var FETCH_INTERVAL = 500;
	var SYNC_INTERVAL = 10000;
	var PURGE_INTERVAL = 10000;
	var ote = null;

	var shouldPurge = false;
	var shouldSync = false;
	// Timers for syncing and purging.
	var syncTimer = setInterval(function() {
		engineSyncOutbound();
	}, SYNC_INTERVAL);
	var purgeTimer = setInterval(function() {
		onPurgeEngine();
	}, PURGE_INTERVAL);

	/** TODO
	  */
	engineSyncOutbound = function() {
		if (shouldSync) {
			var toSend = ote.syncOutbound();
			try {
				comm.engineSync(toSend);
			} catch (e) {
				console.warn("Failed to send engine syncs to server ", e);
				return;
			}
			shouldSync = false;
		}
	};

	/** TODO
	  */
	onPurgeEngine = function() {
		if (shouldPurge)
			ote.purge();
		shouldPurge = false;
	};

	/**
	  * This is our how we communicate with the server. We send an XHR
	  * request every FETCH_INTERVAL milliseconds to fetch remote operations.
	  *
	  * See client.js (the server implementation) for more on the details
	  * of connecting, fetching, etc.
	  */
	var Comm = function() {
		this._interval = FETCH_INTERVAL;
		this._token = null;
		this._valid = true;
	};
	var proto = Comm.prototype;
	proto.engineSync = function(cv) {
		if (!this._valid)
			return false;
		var obj = {
			site: this._token,
			sites: cv
		};
		xhr.post({
			url: "./engineSync",
			handleAs: "json",
			postData: JSON.stringify(obj),
			headers: { "Content-Type" : "application/json" },
			load: function(response) {
				if ("success" == response.status)
					shouldSync = false;
				else
					shouldSync = true;
			}.bind(this),
			error: function() { this._valid = false; }.bind(this),
			handle: function() {}
		});
	};
	proto.connect = function() {
		var obj = {
			command: "connect",
		};
		xhr.post({
			url: "./admin",
			handleAs: "json",
			postData: JSON.stringify(obj),
			headers: { "Content-Type" : "application/json" },
			load: function(response) {
				dom.byId("siteid").innerHTML = "Site ID: " + response.token;
				ote = new OTEngine(response.token);
				this._token = response.token;
				this._valid = true;
			}.bind(this),
			error: function() { this._valid = false; }.bind(this),
			handle: function() {}
		});
		return true;
	};
	proto._fetch = function() {
		if (!this._valid)
			return false;
		var obj = {
			command: "fetch",
			site: this._token
		};
		xhr.post({
			url: "./admin",
			handleAs: "json",
			postData: JSON.stringify(obj),
			headers: { "Content-Type" : "application/json" },
			load: function(response) {
				// Process engine syncs first, then app syncs.
				var engineSyncs = response.engineSyncs;
				var ops = response.ops;
				if (engineSyncs.length > 0) {
					console.log("engine syncs: ",engineSyncs);
					this._processEngineSyncs(engineSyncs);
				}
				if (ops.length > 0) {
					console.log(ops);
					this._processOps(ops);
				}
			}.bind(this),
			error: function() { this._valid = false; }.bind(this),
			handle: function() {}
		});
		setTimeout(function() {
			this._fetch();
		}.bind(this), this._interval);
		return true;
	};
	proto.sendOp = function(op) {
		if (!this._valid)
			return false;
		var obj = {
			site: this._token,
			op: op
		};
		xhr.post({
			url: "./ot",
			handleAs: "json",
			postData: JSON.stringify(obj),
			headers: { "Content-Type" : "application/json" },
			load: function(response) {
			},
			error: function() { this._valid = false; }.bind(this),
			handle: function() {}
		});
		return true;
	};
	/**
	  * @param timeout interval int milliseconds
	  */
	proto.startFetching = function(interval) {
		if (!this._valid)
			return false;
		this._interval = interval;
		setTimeout(function() {
			this._fetch();
		}.bind(this), this._interval);
		return true;
	};
	/** OTEngine needs to process remote engine syncs.
	  */
	proto._processEngineSyncs = function(syncs) {
		array.forEach(syncs, function(at) {
			ote.syncInbound(at.site, at.sites);
		});
	};
	/** OTEngine process a remote op.
	  */
	proto._processOps = function(ops) {
		array.forEach(ops, function(at) {
			/* For each operation, send it to the OT engine. Apply the transformed
			   operation. */
			var op = ote.remoteEvent(at.order, at.op);
			switch (op.type) {
				case "insert":
					bgData.splice(op.position, 0, op.value);
					break;
				case "update":
					bgData[op.position] = op.value;
					break;
				case "delete":
					bgData.splice(op.position, 1);
					break;
			}
			refresh();
		});
	};

	var comm = new Comm();
	comm.connect();
	comm.startFetching(FETCH_INTERVAL);

	// Array of collaborative data (a list of strings).
	var bgData = [];
	/**
	  * Updates the webpage content based on the value of bgData.
	  */
	function refresh() {
		var list = dom.byId("list");
		var str = "";
		array.forEach(bgData, function(at) {
			str += at + "</br>";
		});
		list.innerHTML = str;
	}
	/*
	   Three buttons for ins/upd/del operations.
	   Two inputs to specify position and value.
	  */
	var insBtn = dom.byId("insBtn");
	var updBtn = dom.byId("updBtn");
	var delBtn = dom.byId("delBtn");
	var posInput = dom.byId("pos");
	var valInput = dom.byId("val");

	/* onclick events are simple: update local bgData array, process the event through
	   the OT engine, then send the event to the server via our custom Comm object.
	   */
	insBtn.onclick = function() {
		if (!ote)
			console.warn("OT not ready");
		var pos, val;
		pos = posInput.value;
		val = valInput.value;
		bgData.splice(pos, 0, val);
		refresh();
		/* OTEngine local insert event. */
		var op = ote.createOp("change", val, "insert", pos);
		comm.sendOp(ote.localEvent(op));
		shouldSync = true;
	};
	updBtn.onclick = function() {
		if (!ote)
			console.warn("OT not ready");
		var pos, val;
		pos = posInput.value;
		val = valInput.value;
		bgData[pos] = val;
		refresh();
		/* OTEngine local update event. */
		var op = ote.createOp("change", val, "update", pos);
		comm.sendOp(ote.localEvent(op));
		shouldSync = true;
	};
	delBtn.onclick = function() {
		if (!ote)
			console.warn("OT not ready");
		var pos;
		pos = posInput.value;
		bgData.splice(pos, 1);
		refresh();
		/* OTEngine local delete event. */
		var op = ote.createOp("change", null, "delete", pos);
		comm.sendOp(ote.localEvent(op));
		shouldSync = true;
	};

});

