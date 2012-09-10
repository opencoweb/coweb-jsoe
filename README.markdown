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

###System requirements

Currently, the OCW OT API supports Unix-like systems with the following tools.

* JavaScript platform - for running the OT code itself
* Node.js, npm (optional, for using the OT API with Node.js)
* sphinx docs (optional, for building documentation)

###Getting the code

Application programmers wishing to use the OT API can checkout this project as a
git repository (or submodule into an already existing git repository), or
download the code as a tarball and extract into their project.

The code is available as a Node.JS module accessible via
[npm](https://npmjs.org/), module name
[coweb-jsoe](https://npmjs.org/package/coweb-jsoe).

##Development

This section describes how to setup a development environment to for coweb-jsoe
development.

###Code organization

 * `/src` The source code lives here.
   * `/src/coweb/jsoe` coweb-jsoe OT Engine JavaScript source code
   * `/src/org/requirejs` Contains the i18n requirejs library. See NOTICES.
   * `/src/npm` Source for Node.JS module.
 * `/docs` Sphinx documentation.
 * `/examples` Example code using the OCW OT API.
 * `/bin` Scripts to build release versions of the OCW OT API.
 * `/dist` Release versions.

###Building

See `/bin/README` for building release versions of coweb-jsoe.

##Usage

###Operational Transform

To get started with operational transform, make sure you understand
[the basics](http://opencoweb.org/ocwdocs/intro/openg.html) of operational
transform. At the very least, read the last paragraph entitled
["A final word"](http://opencoweb.org/ocwdocs/intro/openg.html#a-final-word).

The most important concept to understand is that the API guarantees convergence
of local data structures as long as the local application 1) sends remote peers
all local operations and 2) honors all remote operations. The details of the
operational transform algorithm are hidden entirely from the application
developer.

In this library, the two requirements coorespond to the
`OTEngine.localEvent` and `OTEngine.removeEvent` methods, respectively. To
fulfill the requirements, all local data structure changes must call
`localEvent` and send the returned object to all other peers, and all received
remote operations must be passed to `removeEvent`. The transformed operation
returned by `removeEvent` must be applied exactly to the local data structure.

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

##Documentation

To build the docs, change directory to `docs/` and run a `make html`. The
documentation relies on Sphinx to build.

A work-in-progress version of the documentation exists online
[here](http://opencoweb.org/jsoedocs).

##Support

Please report any issues on the
[GitHub issue tracker](https://github.com/opecoweb/coweb-jsoe/issues).

##OpenCoweb
This library was initially started as a part of the
[OpenCoweb](https://github.com/opencoweb/coweb) project. OpenCoweb provides a
Java-based server and uses cometd techniques to allow remote peer communication
and exchange of remote events. OpenCoweb incorporates the OT API to allow
developers to write collaborative groupware web-based applications.

