
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

{JSON} createOp(topic, value, type, position)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Applications must call this to create an opaque object that the OTEngine can
understand. Specifically, calls to localEvent require as an argument an object
returned from createOp.

{JSON} localEvent(op)
~~~~~~~~~~~~~~~~~~~~~

Local peers must call this when a local data structure has changed. The local
engine processes the operation. The returned JSON object must be forwarded to
remote peers unchanged.

{JSON} remoteEvent(op, order)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Local peers must call this to have the local engine process a remote peer's
change. The JSON object passed to remoteEvent must be the exact JSON object
returned by the remote peer's call to localEvent. Furthermore, remoteEvent
takes a second integer argument that specifies the given operation's total
order. Typically, some central server will decide the total order. The total
order must be provided by the application of this OT API by some unspecified
means.

{JSON} syncOutbound(void)
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

Examples
========

Consider two peers, Alice and Bob, who are able to communicate via some
unspecified means (I know...this isn't a cryptography library).

Alice
~~~~~

..sourcecode:: javascript

	define(["OTEngine"], function(OTEngine) {
		ote = new OTEngine(0);

