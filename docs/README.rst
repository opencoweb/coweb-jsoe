
========================
OCW OT API Documentation
========================

Overview
========

The single interface provided for application programmers is `OTEngine`. Any
JSON encodable object returned by this API should be considered opaque by the
application developer and must not be altered or depended upon as the internal
representations may change from version to version.

OTEngine
========

JSON createOp(topic, value, type, position)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Applications must call this to create an opaque object that the OTEngine can
understand. Specifically, calls to localEvent require as an argument an object
returned from createOp.

JSON localEvent(op)
~~~~~~~~~~~~~~~~~~~~~

Local peers must call this when a local data structure has changed. The local
engine processes the operation. The returned JSON object must be forwarded to
remote peers unchanged.

JSON remoteEvent(op, order)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Local peers must call this to have the local engine process a remote peer's
change. The JSON object passed to remoteEvent must be the exact JSON object
returned by the remote peer's call to localEvent. Furthermore, remoteEvent
takes a second integer argument that specifies the given operation's total
order. Typically, some central server will decide the total order. The total
order must be provided by the application of this OT API by some unspecified
means.

JSON syncOutbound(void)
~~~~~~~~~~~~~~~~~~~~~~~~~

This should be called periodically by the application to retrieve local internal
engine state (context vector). The returned object must be forwarded to all
other remote peers. The suggested interval for calling this method is every ten
seconds.

void syncInbound(site, state)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Applications should call this method when they receive a remote peer's internal
engine state (the context vector returned from the remote peer's syncOutbound
call).

boolean purge(void)
~~~~~~~~~~~~~~~~~~~

Applications should call this to purge internal engine state. The engine's
history buffer is garbage collected. Returns whether or not the engine was
purged.

boolean isStable(void)
~~~~~~~~~~~~~~~~~~~~~~

Returns whether or not the OTEngine is in a "valid" state. This means whether or
not calls to localEvent, etc will continue to succeed. If the engine is not in a
valid state, then calling localEvent, etc will be a noop. An invalid state means
that the local data can no longer guaranteed to be in sync with that of remote
peers.

Example
=======

Consider two peers, Alice and Bob, who are able to communicate via some
unspecified means (I know...this isn't a cryptography library).

Suppose also that there exists some JavaScript class, `MyServer` that allows
Alice and Bob to communicate. This unspecified communication medium can generate
unique Ids to be used as site Ids and will generate a total order when peers
send operations to other peers. All the following code that references the
`server` object exists purely to facilitate the usefulness of this example.

Our example application is a collaborative shopping list. This example is
hypothetical and not complete - only portions of a hypothetical shopping list
application is shown.

Remote Operation Handler
~~~~~~~~~~~~~~~~~~~~~~~~

Alice and Bob both have the following function available for use. This function
takes as an argument the returned value from `OTEngine::remoteEvent` and
performs an application specific algorithm (in this case, update the shopping
list).

    function apply(array, op) {
		if ("insert" === op.type)
			array.splice(op.position, 0, op.value);
		else if ("update" === op.type)
			array[op.position] = op.value;
		else if ("delete" === op.type)
			array.splice(op.position, 1);
	}

Alice
~~~~~

	/* MyServer is some object that allows Alice to communicate with Bob (not
	   provided by this API. */
	var server = MyServer();
	var collabList = [];
	var ote = new OTEngine(server.getUniqueId());
	server.onReceive(function(fromId, type, order, data) {
		/* This will be called upon receiving any data from remote peers. fromId
		   is the remote peer's siteId, type tells us what to do with the data.
		   Order is a generated total order for remote operations (if
		   type=="op").
		 */
		if ("op" === type) {
			var toApply = ote.remoteEvent(data, order);
			apply(collabList, toApply);
		} else if ("engine" === type) {
			ote.syncInbound(fromId, data);
		}
	});

Bob
~~~

	/* MyServer is some object that allows Bob to communicate with Alice (not
	   provided by this API. */
	var server = MyServer();
	var collabList = [];
	var ote = new OTEngine(server.getUniqueId());
	server.onReceive(function(fromId, type, order, data) {
		/* This will be called upon receiving any data from remote peers. fromId
		   is the remote peer's siteId, type tells us what to do with the data.
		   Order is a generated total order for remote operations (if
		   type=="op").
		 */
		if ("op" === type) {
			var toApply = ote.remoteEvent(data, order);
			apply(collabList, toApply);
		} else if ("engine" === type) {
			ote.syncInbound(fromId, data);
		}
	});

Now that both peers have engines running, Alice and Bob can begin making changes
to their collaborative list. Suppose, for example, that Alice executes the
following.

Alice
~~~~~

	collabList.splice(0, 0, "Apples");
	var op = ote.createOp("change", "Apples", "insert", 0);
	var toSend = ote.localEvent("shopping_list", op);
	server.sendOut(
			"op", /* Specify we are sending an operation. */
			JSON.stringify(toSend)
	);

Bob's onReceive will run and call `ote.remoteEvent`. The returned object must be
applied exactly to his local data (`collabList`).

Engine Syncs
------------

Periodically, Alice and Bob must send their local engine state to each other.
For example, Alice might do the following.

    setInterval(function() {
		var toSend = ote.syncOutbound();
		server.sendOut(
			"engine", /* We are sending engine syncs. */
			JSON.stringify(toSend)
		);
	}, 10 * 1000);

