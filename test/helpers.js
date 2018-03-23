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

function randomBytes32String() {
    return '0x' + crypto.randomBytes(32).toString('hex');
}

function randomInt(min, max) {
    return (min + Math.random() * (max - min)) << 0;
}

function pad(val, padchar, count) {
    return val + Array(count - val.length).join(padchar);
}

module.exports = { expectedEvent, assertError, randomBytes32String, randomInt, pad };