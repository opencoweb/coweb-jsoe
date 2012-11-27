
var OTEngine = require("coweb-jsoe").OTEngine;

var mod = new OTEngine(0);
var ot1 = new OTEngine(1);
var ot2 = new OTEngine(2);

/*
st1 = mod.syncOutbound();
st2 = ot1.syncOutbound();
st3 = ot2.syncOutbound();

mod.syncInbound(1, st2);
mod.syncInbound(2, st3);
ot1.syncInbound(0, st1);
ot1.syncInbound(2, st3);
ot2.syncInbound(0, st1);
ot2.syncInbound(1, st2);
*/

op2 = mod.createOp("change", {}, "insert", 0);
op1 = ot1.createOp("change", {}, "insert", 1);
op1order = 0;
op2order = 1;

s1 = ot1.localEvent(op1);
mod.remoteEvent(op1order, s1);
s2 = mod.localEvent(op2);

console.log(s1.sites);
console.log(s2.sites);

console.log("ot2:",ot2._engine.cvt.getState());
ot2.remoteEvent(op2order, s2);
console.log("ot2:",ot2._engine.cvt.getState());
ot2.remoteEvent(op1order, s1);

