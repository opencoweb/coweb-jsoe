
# OpenCoweb OT API Examples - Node.js

First of all, in order to use the OT API with Node.js, you will need to install
the requirejs module. See the README in the root directory of this project for
instructions.

Run `npm install requirejs` in this directory so that NodeClient.js can access
this required module.

## The example

In this example, clients running on the same machine will collaboratively edit
an array of strings (a list). The command line interface is simple (and a little
lacking), but the code itself should serve a useful purpose.

## Usage

First, set up a directory where the application can write files to. The "server" 
uses this directory to let clients communicate. For example, create `/tmp/OT`.

Now, run `node NodeClient.js /tmp/ot` (or use whatever directory path you
created). Type `h` to see a list of options.

###Example use case

Open two bash shells and run `node NodeClient.js <path>` in both. In console 1,
insert *two* at position 0 (`a 0 two`). In console 2, insert *one* at position
0 (`a 0 one`). In console 1, insert *three* at position 2 (`a 2 three`). Now,
view the list in both consoles (`v`). Both should contain the the three items
*one*, *two*, and *three* in that order.

## The code

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

##Troubleshooting

This Node.js example uses the local file system to communicate between peers,
and relies on a global file lock to operate correctly. In the event that a node
process is not shutdown properly (eg. a `kill -9` or an exception), the lock
file might still exist, thus preventing any other clients to run. Deleting the
lock file and restarting the clients will fix the problem
(`rm <shared directory>/lock`).

