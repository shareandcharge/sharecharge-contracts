const crypto = require('crypto');

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
        assert.equal(err.message, 'VM Exception while processing transaction: revert');
        done && done();
    });
}

const connector = '0x' + crypto.randomBytes(32).toString('hex');
const client = '0x' + crypto.randomBytes(32).toString('hex');
module.exports = { expectedEvent, assertError, connector, client }; 