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
        assert.equal(err.message, 'VM Exception while processing transaction: revert');
        done && done();
    });
}

const connector = {
    id: '0x' + crypto.randomBytes(32).toString('hex'),
    client: '0x' + crypto.randomBytes(32).toString('hex'),
    owner: web3.utils.asciiToHex('Jim'),
    lat: web3.utils.asciiToHex('52.8'),
    lng: web3.utils.asciiToHex('-0.6'),
    price: 1,
    model: 1,
    plugType: 2,
    openingHours: web3.utils.asciiToHex('0024002400240024002400240024'),
    isAvailable: true
};

module.exports = {expectedEvent, assertError, connector};