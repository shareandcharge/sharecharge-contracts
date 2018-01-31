const { assertError, connector } = require('./helpers');

const StationStorage = artifacts.require("./StationStorage.sol");

contract('StationStorage', function (accounts) {

    let storage;

    beforeEach(async () => {
        storage = await StationStorage.new();
    })

    it('Should register a new connector', async () => {
        await storage.registerConnector(accounts[0], connector, true);
        assert.equal(await storage.getOwner(connector), accounts[0]);
        assert.equal(await storage.isAvailable(connector), true);
        assert.equal(await storage.isVerified(connector), false);
    });

    it('Should only allow connector owner to verify it', (done) => {
        storage.registerConnector(accounts[0], connector, true).then(() => {
            assertError(() => storage.verifyConnector(connector, { from: accounts[1] }), done);
        });
    });

    it('Should allow connector owner to update availability', async () => {
        await storage.registerConnector(accounts[1], connector, false);
        assert.equal(await storage.isAvailable(connector), false);
        
        await storage.setAvailability(connector, true, { from: accounts[1] });
        assert.equal(await storage.isAvailable(connector), true);
    });

});
