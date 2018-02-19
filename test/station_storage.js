const { assertError, connector, client, lat, long, termsAndConditions } = require('./helpers');

const StationStorage = artifacts.require("./StationStorage.sol");

contract('StationStorage', function (accounts) {

    let storage, contractAddress, params;

    beforeEach(async () => {
        storage = await StationStorage.new();
        contractAddress = accounts[2];        
        params = Object.values(connector);
        params = [...params.slice(0, 2), accounts[1], ...params.slice(2, 10)];
    });

    it('Should register a new connector', async () => {
        await storage.register(...params);
        const res = await storage.connectors(connector.id);
        const id = await storage.ids(0);
        assert.equal(id, connector.id);
        assert.equal(res.length, 11);
        assert.equal(res[0], connector.client);
        assert.equal(res[res.length - 3], connector.openingHours);
    });

    it('Should allow contract to update availability', async () => {
        params[10] = false;
        await storage.setAccess(contractAddress);
        const res = await storage.register(...params);
        assert.equal(await storage.isAvailable(connector.id), false);
        
        await storage.setAvailability(connector.id, true, { from: contractAddress });
        assert.equal(await storage.isAvailable(connector.id), true);
    });

    it('Should fail if setter not called by address with restricted access', (done) => {
        storage.setAccess(contractAddress).then(() => {
            storage.register(...params)
                .then(() => {
                    assertError(() => storage.setSession(connector.id, accounts[0], { from: accounts[1] }), done);
                })
        });
    });

});
