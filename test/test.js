// var PoorSession = require('poor-session');
var PoorSession = require('..');

var poorSess = new PoorSession({
    sessionMaxAge: 1000 * 5,
    // checkInterval: 1000 * 1,
    autoTouch: false,
    afterDestroySession: function(session) {
        console.log(0, " * afterDestroySession", session);
    }
});

var session = poorSess.createSession();
session.name = "Tom";

console.log("---------------------------------------");
console.log("createSession", session);
console.log("---------------------------------------");

var sessionId = session.sessionId;

setTimeout(function() {
    var session = poorSess.loadSession(sessionId);
    console.log(1, "loadSession", session);
}, 1000 * 1);

setTimeout(function() {
    var session = poorSess.loadSession(sessionId);
    poorSess.clearSession(session);
    console.log(2, "loadSession & clearSession", session);
}, 1000 * 2);

setTimeout(function() {
    var session = poorSess.loadSession(sessionId);
    console.log(3, "loadSession", session);
    session.name = "Jim";
}, 1000 * 3);

setTimeout(function() {
    var session = poorSess.loadSession(sessionId);
    console.log(4, "loadSession", session);
}, 1000 * 4);

// 5
// TODO

setTimeout(function() {
    var session = poorSess.loadSession(sessionId);
    console.log(6, "loadSession", session);
}, 1000 * 6);
