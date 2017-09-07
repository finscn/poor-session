var uid = require('uid-safe').sync;

var PoorSession = function(options) {
    for (var p in options) {
        this[p] = options[p];
    }

    this.init();
};

PoorSession.reservedProperties = [
    "sessionId",
    "sessionMaxAge",
];

var proto = {

    autoTouch: true,

    sessionMaxAge: 20 * (60 * 1000),

    sessionKey: 'X-Poor-Session',

    init: function() {
        this.store = {};
        this.destroyTask = {};
    },

    generateSessionId: function(sess) {
        return uid(24);
    },

    // req : express request object
    // res : express response object
    requestSession: function(req, res) {
        var id = req.get(this.sessionKey);
        var sess = id ? this.store[id] : null;
        if (!sess) {
            sess = this.createSession();
        } else if (this.autoTouch) {
            this.touch(sess);
        }

        if (res) {
            res.set(this.sessionKey, sess.sessionId);
        }

        return sess;
    },
    // res : express response object
    responseSession: function(res, sess) {
        if (sess) {
            res.set(this.sessionKey, sess.sessionId);
        }
    },

    getSession: function(id) {
        var sess = this.store[id] || null;
        return sess;
    },

    createSession: function(options) {
        var sess = {};
        if (options) {
            for (var p in options) {
                sess[p] = options[p];
            }
        }

        var id = this.generateSessionId(sess);
        sess.sessionId = id;

        this.store[id] = sess;

        this.touch(sess);

        this.afterCreateSession(sess);

        return sess;
    },
    afterCreateSession: function(sess) {

    },

    touch: function(sess) {
        var Me = this;
        var maxAge = ("sessionMaxAge" in sess ? sess.sessionMaxAge : this.sessionMaxAge) || 0;
        var id = sess.sessionId;
        clearTimeout(this.destroyTask[id]);
        if (maxAge) {
            this.destroyTask[id] = setTimeout(function() {
                Me.destroySession(sess);
            }, maxAge);
        }
    },

    clearSession: function(sess) {
        var removed = null;
        if (sess) {
            var reserved = PoorSession.reservedProperties;
            removed = {};
            for (var key in sess) {
                if (reserved.indexOf(key) === -1) {
                    removed[key] = sess[key];
                    delete sess[key];
                }
            }
        }
        return removed;
    },

    destroySession: function(sess) {
        if (sess) {
            var id = sess.sessionId;
            delete this.store[id];
            clearTimeout(this.destroyTask[id]);
            delete this.destroyTask[id];
            this.afterDestroySession(sess);
        }
        return sess;
    },
    afterDestroySession: function(sess) {

    },

    clearAllSessions: function() {
        for (var id in this.store) {
            var sess = this.store[id];
            this.clearSession(sess);
        }
    },
    destroyAllSessions: function() {
        for (var id in this.store) {
            var sess = this.store[id];
            this.destroySession(sess);
        }
    },
};

for (var p in proto) {
    PoorSession.prototype[p] = proto[p];
}

module.exports = PoorSession;