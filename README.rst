#Operational Transformation Engine API

##About

This project contains the JavaScript source for the operational transformation
(OT) engine. The OT engine is exposed as a library for application programmers
who wish to build collaborative groupware applications.

The OT API is built using Asynchronous Module Definitions (AMD) so that it can
easily be used with any toolkit that supports AMD loading (eg. Dojo). The OT API
can also be used with Node.js with the requirejs module for loading the OT
library.

##Getting started

###Requirements

Currently, the OCW OT API supports Unix-like systems with the following tools.

* make
* curl
* Node.js, npm (optional, for using the OT API with Node.js)
* sphinx docs (optional, for documentation)

###Getting the code

Application programmers wishing to use the OT API can checkout this project as a
git repository (or submodule into an already existing git repository), or
download the code as a tarball and extract into their project.

###Setup

In the root directory of this project, run `make install`. This fetches required
dependencies (currently, only RequireJSs' i18n library).

##Usage

###API usage

Each participating *peer* has its own instance of an operation engine. Each peer
maintains its own local copy of the collaborative data (there is no centrally
located copy of the data).

The engine is exposed through the use of two primary mechanisms: applying
local/remote operations and sending/retrieving engine internal data structures.
Each API call returns a data structure (eg. JSON) that should be forwarded to
other remote peers exactly as is. Remote peers then send this data structure
through another API call, which returns an operation that should be applied
to a local copy of the data.

##Requirements

This OT library provides only the
[operational transform](http://en.wikipedia.org/wiki/Operational_transformation)
algorithms and exposure to the engine. Communication between remote clients is
not provided by this library. Thus, the application programmer is responsible
for the communication mechanism (eg. hosting a central server to ferry data
between clients).

Example code is provided that creates a Node.js
server for remote clients to communicate and exchange data, but this is purely
for demonstration purposes.

###Site Ids

All participating peers must have a unique *site Id* assigned to them. This site
Id must be an integer value in the range [0, 2^32-1] that can safely be
represented by all undering agents. The safest and easiest way to assign site
Ids is with a central server. It is recommended that a counter be used to assign
increasing Ids starting from zero.

###Total order

The underlying engine algorithm requires that all operations be totally ordered.
The simplest way to achieve this is for a central entity to arbitrarily provide
this. For example, the OpenCoweb project has a central server append a unique
integer to each operation before it sends the operations to other peers.

No two operations should ever be considered *equal*. Even if two operations
match identically, they should be assigned unique orders. Thus, the total order
requirement imposed by the OT engine is a little different from the set theory
total order, since no two elements may be equal.

For optimal engine performance, the total order should be *close* to the
temporal order that peers generate operations.

###Syncing engine state

Each peer's operation engine maintains an internal data structure that tracks
each peer's internal engine state. Thus, periodically, peers must distribute
their local engine state to remote peers. In this and other documents, the
internal state is sometimes referred to as the engine's *context vector*. The OT
API provides two methods for this: `syncOutBound` and `syncInBound`.

`syncOutBound` takes no arguments and returns a JSON encodable object. This
object must be sent to other peers in its exact state.

`syncInBound` takes two arguments, the integer site Id of the remote peer whose
engine state we are syncing and the remote engine state itself.

It is recommended that each peer distributes its local engine state to remote
peers every **ten** seconds.

##Documentation

To build the docs, change directory to `docs/` and run a `make html`. The
documentation relies on Sphinx to build.

Currently, there does not exist a production version of the built documentation
(i.e. if you want to see it, you must build it yourself).

##OpenCoweb
This library was initially started as a part of the
[OpenCoweb](https://github.com/opencoweb/coweb) project. OpenCoweb provides a
Java-based server and uses cometd techniques to allow remote peer communication
and exchange of remote events. OpenCoweb incorporates the OT API to allow
developers to write collaborative groupware web-based applications.

