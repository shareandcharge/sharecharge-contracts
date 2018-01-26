const crypto = require('crypto');

const ChargingStationStorage = artifacts.require("./ChargingStationStorage.sol");

contract('ChargingStationStorage', function (accounts) {

    let storage;

    beforeEach(async () => {
        storage = await ChargingStationStorage.new();
        connector = '0x' + crypto.randomBytes(32).toString('hex');
    })

    it('Should register a new connector', async () => {
        await storage.registerConnector(connector, true);
        assert.equal(await storage.isAvailable(connector), true);
        assert.equal(await storage.isVerified(connector), false);
        assert.equal(await storage.isAvailable(connector), true);
    })

    it('Should verify a new connector', async () => {
        await storage.registerConnector(connector, true);
        assert.equal(await storage.isVerified(connector), false);

        storage.verifyConnector(connector);
        assert.equal(await storage.isVerified(connector), true);
    })

    it('Should only allow connector owner to verify it', (done) => {
        storage.registerConnector(connector, true, { from: accounts[0] })
            .then(() => storage.verifyConnector(connector, { from: accounts[1] })
                .then(assert.fail)
                .catch((err) => {
                    assert.equal(err.message, 'VM Exception while processing transaction: revert');
                    done();
                }));
    })
});
