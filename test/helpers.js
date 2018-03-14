const crypto = require('crypto');
const web3 = require('web3');

function expectedEvent(targetEvent, callback) {
    return new Promise((resolve, reject) => {
        const eventListener = targetEvent({}, (err, res) => {
            callback(res.args);
            eventListener.stopWatching();
            resolve();
        });
    });
}

function assertError(callback, done) {
    callback().then(assert.fail).catch((err) => {
        assert(err.message && err.message.length > 0);
        done && done();
    });
}


module.exports = { expectedEvent, assertError };