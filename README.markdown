#Operational Transformation Engine API

##About

This project contains the JavaScript source for the operational transformation
(OT) engine.

The OT engine is exposed as a library for application programmers who wish to
build collaborative groupware applications.

##Usage

Application programmers wishing to use the OT API can checkout this project as a
git repository (or submodule into an already existing git repository), or
download the code as a tarball and extract into their project.

Each participating *peer* has its own instance of an operation engine. Each peer
maintains its own local copy of the collaborative data.

The engine is exposed through the use of two primary mechanisms: applying
local/remote operations and sending/retrieving engine internal data structures.
Each API call returns a data structure (eg. JSON) that should be forwarded to
other remote peers exactly as is. Remote peers then send this data structure
through another API call, which returns an operation that should be applied
to a local copy of the data.

##Requirements

This OT API library does not provide a mechanism to communicate directly with
remote peers. Thus, the application programmer is responsible for the
communication mechanism (eg. hosting a central server to ferry data between
clients).

##OpenCoweb
This library was initially started as a part of the
[OpenCoweb](https://github.com/opencoweb/coweb) project. OpenCoweb provides a
Java-based server and uses cometd techniques to allow remote peer communication
and exchange of remote events. OpenCoweb incorporates the OT API to allow
developers to write collaborative groupware web-based applications.

