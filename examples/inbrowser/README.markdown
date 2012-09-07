
#OpenCoweb OT Engine API Example - In browser client

##About

This demonstrates how to use the OCW OT engine as a standalone API.

The code in this directory is a Node.js server and simple cooperative list web
application client (logically similar to the OCW CoList demo).

In this scenario, the client is the only entity that uses the coweb-jsoe. The
server exists to facilitate communication among remote clients and fulfill some
requirements of the OT engine (eg: a total order for operations).

This example uses the 0.8.3 release of coweb-jsoe (in
dist/jsoe/coweb-jsoe-0.8.3).

##Running and usage

To run the Node.js server, run `node server.js`. To specify a port to listen on,
use `node server.js <port>`.

Navigate to http://localhost:8889 (the default port the server listens on) in
two or three (or more) windows. Note at the top of each webpage there should be
text saying "Site ID: <number>". Use the interface to insert/update/delete the
list. Note that all clients should remain synchronized.

##Server requirements

As demonstrated by the Node.js server, the server must at a minimum provide
certain functionality as described below.

 * Assign unique IDs to clients: each participating client needs a unique ID
   to distinguish it from others. The server should provide this.
 * Ferry operations: remote clients must know when some client performs an
   operation (eg: insert). Clients can send oprations to the server, and the
   server will send these to all other remote clients.
 * Assign a total order to operations: all operations should be totally ordered,
   and the server must provide this. When remote syncs are sent to other
   clients, the server should send this total order information for each sync.
 * Ferry engine state syncs: clients periodically must send their OT engine's
   context vector to other clients, and the server must fulfill this.

##Server-Client communication

This section describes how the Node.js server and browser JS client communicate.
Note this protocol in unrelated to coweb-jsoe.

HTTP requests with path ./admin, ./ot, or ./engineSync are how the client talks
to the server. The server expects an HTTP POST JSON message with a `command`
attribute, among other attributes. The server will send back a response with a
`success` attribute, among others.

Each request (except ./admin connect) should include a `site` JSON attribute
with the unique site ID of the requesting client.

Note that while the typical OCW coweb-java communication is cometd, I chose a
simpler approach where the client frequently polls the server for updates
(instead of the cometd approach of the server sending updates to clients as
soon as they are available).

 * ./admin
   * command = connect
     The server allocates a unique token for the requester and sends it back.
     This unnique token should be considered the site ID of the client.
   * command = fetch
     Periodically, the client will ask for an update (engine syncs and engine
     ops). All queued engine syncs and ops are send back to the client.
 * ./engineSync
   * No command attribute here...the client sends its engine's context vector so
     that other clients can sync their engine state.
 * ./ot
   * No command attribute here either, the client just sends an operation to be
     queued up and sent to other clients. The server applies the total order
     here.

