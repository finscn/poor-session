// var PseudoSession = require('pseudo-session');
var PseudoSession = require('..');

var pseudoSess = new PseudoSession({
    sessionMaxAge: 1000 * 5,
    afterDestroySession: function(session) {
        console.log("afterDestroySession", session);
    }
});

var session = pseudoSess.createSession();

session.name = "Tom";

var sessionId = session.sessionId;

setTimeout(function() {
    var session = pseudoSess.getSession(sessionId);
    console.log(session);
}, 1000 * 2);

setTimeout(function() {
    var session = pseudoSess.getSession(sessionId);
    pseudoSess.clearSession(session);
    console.log(session);
}, 1000 * 3);

setTimeout(function() {
    var session = pseudoSess.getSession(sessionId);
    console.log(session);
}, 1000 * 4);

// 5

setTimeout(function() {
    var session = pseudoSess.getSession(sessionId);
    console.log(session)
}, 1000 * 6);