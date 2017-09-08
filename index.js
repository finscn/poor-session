var uid = require('uid-safe').sync;

var PoorSession = function(options) {
    for (var p in options) {
        this[p] = options[p];
    }

    this.init();
};

PoorSession.reservedProperties = [
    "sessionId",
];

var proto = {

    autoTouch: true,

    sessionMaxAge: 20 * (60 * 1000),

    sessionKey: 'X-Poor-Session',

    interval: 1000 * 10,

    init: function() {
        this.store = {};
        this.sessionExpires = {};

        var Me = this;
        this.intervalTask = setInterval(function() {
            Me.checkExpires();
        }, this.interval);
    },

    generateSessionId: function(sess) {
        return uid(24);
    },

    // req : express request object
    // res : express response object
    requestSession: function(req, res) {
        var id = req.get(this.sessionKey);

        var sess = this.loadSession(id);

        if (res) {
            res.set(this.sessionKey, sess.sessionId);
        }

        return sess;
    },

    loadSession: function(id) {
        var sess = id ? this.store[id] : null;
        if (!sess) {
            sess = this.createSession();
        } else {
            var e = this.sessionExpires[id];
            if (e > 0 && e <= Date.now()) {
                sess = this.store[id];
                this.destroySession(sess);
                sess = this.createSession();
            } else if (this.autoTouch) {
                this.touch(sess);
            }
        }
        return sess;
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
        var maxAge = this.sessionMaxAge || 0;
        var id = sess.sessionId;
        if (maxAge) {
            this.sessionExpires[id] = Date.now() + maxAge;
        }
    },

    checkExpires: function() {
        var now = Date.now();
        for (var id in this.store) {
            var e = this.sessionExpires[id];
            if (e > 0 && e <= now) {
                var sess = this.store[id];
                this.destroySession(sess);
            }
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
            delete this.sessionExpires[id];
            delete this.store[id];
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

    destroy: function() {
        this.destroyAllSessions();
        clearInterval(this.intervalTask);
    }
};

for (var p in proto) {
    PoorSession.prototype[p] = proto[p];
}

module.exports = PoorSession;