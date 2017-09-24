// var PseudoSession = require('pseudo-session');
var PseudoSession = require('..');

var pseudoSess = new PseudoSession({
    sessionMaxAge: 1000 * 5,
    // checkInterval: 1000 * 1,
    autoTouch: false,
    afterDestroySession: function(session) {
        console.log("afterDestroySession: ", session);
    }
});

var session = pseudoSess.createSession();
session.name = "Tom";

var sessionId = session.sessionId;

setTimeout(function() {
    var session = pseudoSess.loadSession(sessionId);
    console.log(1, session);
}, 1000 * 1);

setTimeout(function() {
    var session = pseudoSess.loadSession(sessionId);
    pseudoSess.clearSession(session);
    console.log(2, session);
}, 1000 * 2);

setTimeout(function() {
    var session = pseudoSess.loadSession(sessionId);
    console.log(3, session);
    session.name = "Jim";
}, 1000 * 3);

setTimeout(function() {
    var session = pseudoSess.loadSession(sessionId);
    console.log(4, session);
}, 1000 * 4);

// 5

setTimeout(function() {
    var session = pseudoSess.loadSession(sessionId);
    console.log(6, session)
}, 1000 * 6);