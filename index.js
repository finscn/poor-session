var uid = require('uid-safe').sync;

var PoorSession = function(options) {
    for (var p in options) {
        this[p] = options[p];
    }

    this.init();
};

PoorSession.reservedProperties = [
    "sessionId",
    "maxAge",
    "expires",
];

var proto = {

    sessionKey: 'X-Poor-Session',
    sessionMaxAge: 20 * (60 * 1000),

    // if == 0, will not check expires automatically
    cleanUpInterval: 20 * 1000,

    autoTouch: true,

    init: function() {
        this.store = {};

        if (this.cleanUpInterval) {
            this.startCleanUp();
        }
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
            if (sess.expires <= Date.now()) {
                this.destroySession(sess);
                sess = this.createSession();
            } else if (this.autoTouch) {
                this.touchSession(sess);
            }
        }
        return sess;
    },

    getSession: function(id) {
        var sess = this.store[id] || null;
        return sess;
    },

    createSession: function(options) {
        var sess = {
            "maxAge": this.sessionMaxAge
        };
        if (options) {
            for (var p in options) {
                sess[p] = options[p];
            }
        }

        var id = this.generateSessionId(sess);
        sess.sessionId = id;
        this.touchSession(sess);

        this.store[id] = sess;

        this.afterCreateSession(sess);

        return sess;
    },

    afterCreateSession: function(sess) {

    },

    startCleanUp: function() {
        var Me = this;
        this.stopCleanUp();
        this._cleanUpIntervalId = setInterval(function() {
            var removedCount = Me.cleanUp();
            // console.log("Expired & Removed : ", removedCount);
        }, this.cleanUpInterval);
    },

    stopCleanUp: function() {
        clearInterval(this._cleanUpIntervalId);
    },

    cleanUp: function() {
        var now = Date.now();
        var count = 0;
        for (var id in this.store) {
            var sess = this.store[id];
            if (sess && sess.expires <= now) {
                count++;
                this.destroySession(sess);
            }
        }
        return count;
    },

    touchSession: function(sess) {
        maxAge = sess.maxAge || 0;
        if (maxAge <= 0) {
            maxAge = Infinity;
        }
        sess.expires = Date.now() + maxAge;
    },

    clearSession: function(sess) {
        if (sess) {
            var reserved = PoorSession.reservedProperties;
            for (var p in sess) {
                if (reserved.indexOf(p) === -1) {
                    delete sess[p];
                }
            }
        }
        return sess;
    },

    destroySession: function(sess) {
        if (sess) {
            delete this.store[sess.sessionId];
            this.afterDestroySession(sess);
        }
    },
    afterDestroySession: function(sess) {

    },

    touchAllSessions: function() {
        for (var id in this.store) {
            var sess = this.store[id];
            this.touchSession(sess);
        }
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
        this.stopCleanUp();
        this.destroyAllSessions();
    }
};

for (var p in proto) {
    PoorSession.prototype[p] = proto[p];
}

module.exports = PoorSession;
