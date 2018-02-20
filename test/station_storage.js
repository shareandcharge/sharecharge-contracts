const { assertError, connector, client, lat, long, termsAndConditions } = require('./helpers');

const StationStorage = artifacts.require("./StationStorage.sol");

contract('StationStorage', function (accounts) {

    let storage, contractAddress, params;
    const emptyAddr = '0x0000000000000000000000000000000000000000';
    const emptyBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

    beforeEach(async () => {
        storage = await StationStorage.new();
        contractAddress = accounts[2];        
        params = Object.values(connector);
        params = [...params.slice(0, 2), accounts[1], ...params.slice(2, 10)];
    });

    context('setters', function() {

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
            await storage.register(...params);
            assert.equal(await storage.isAvailable(connector.id), false);
            
            await storage.setAvailability(connector.id, true, { from: contractAddress });
            assert.equal(await storage.isAvailable(connector.id), true);
        });

        it('should allow contract to update session', async () => {
            await storage.setAccess(contractAddress);
            await storage.register(...params);
            storage.setSession(connector.id, accounts[3], { from: accounts[2] });
            assert.equal(await storage.getSession(connector.id), accounts[3]);
        })
    
        it('Should fail if setter not called by address with restricted access', (done) => {
            storage.setAccess(contractAddress).then(() => {
                storage.register(...params)
                    .then(() => {
                        assertError(() => storage.setSession(connector.id, accounts[0], { from: accounts[1] }), done);
                    })
            });
        });

    });

    context('getters', function() {

        it('should get connector information for charging contract', async () => {
            await storage.register(...params);
            assert.equal(await storage.isAvailable(connector.id), true);
            assert.equal(await storage.getOwner(connector.id), accounts[1]);
            assert.equal(await storage.getClient(connector.id), connector.client);
            assert.equal(await storage.getSession(connector.id), emptyAddr);
        });

    });


});
