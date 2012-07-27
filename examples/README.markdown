
# OpenCoweb OT API Examples

## Node.js

First of all, in order to use the OT API with Node.js, you will need to install
the requirejs module. See the README in the root directory of this project for
instructions.

### The example

In this example, clients running on the same machine will collaboratively edit
an array of strings (a list). The command line interface is simple (and a little
lacking), but the code itself should serve a useful purpose.

### Usage

### The code

Two files are provided: `NodeClient.js` and `NodeOTServer.js`. The NodeOTServer
module contains a single class LocalServerConnection that provides communication
for each client. All message passing is through the file system. There are two
files that all peers use: `order` and `lock`. The order file keeps track of a
global total order incrementing integer, and the lock file is used as a mutex
lock for executing critical sections of code (reading/writing to the total order
file, for example).

Each peer is assigned a single file in the specified directory. Peers append
messages to each other's files and each their own files periodically to receive
messages. See `NodeOTServer.js` for more.

The `NodeClient.js` uses the exposed OT API to keep the shared list
synchronized. Notice the timers that purge and send out engine state syncs.

