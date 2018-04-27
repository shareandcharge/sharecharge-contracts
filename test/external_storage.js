const ExternalStorage = artifacts.require('./ExternalStorage.sol');
const helpers = require('./helpers');

function newLocation() {
    return {
        id: helpers.randomBytes32String(),
        hash: helpers.randomBytes32String()
    }
}

contract('ExternalStorage', function (accounts) {

    let storage;

    beforeEach(async () => {
        storage = await ExternalStorage.new();
    });

    context('#addLocation()', () => {

        it('should add location to CPO data structure', async () => {
            const loc1 = newLocation();
            const loc2 = newLocation();
            const tx1 = await storage.addLocation(loc1.id, loc1.hash);
            console.log(tx1.receipt.gasUsed);
            const tx2 = await storage.addLocation(loc2.id, loc2.hash);
            console.log(tx2.receipt.gasUsed);            
            const storedHash = await storage.getLocationById(accounts[0], loc1.id);
            expect(storedHash).to.equal(loc1.hash);
            const ids = await storage.getGlobalIDsByCPO(accounts[0]);
            expect(ids.length).to.equal(2);
        });

        it('should not allow a location to be re-added', async () => {
            const loc = newLocation();
            await storage.addLocation(loc.id, loc.hash);
            loc.hash = helpers.randomBytes32String();
            try {
                await storage.addLocation(loc.id, loc.hash);
                expect.fail();
            } catch (err) {
                expect(err.message.search('revert') !== -1).to.equal(true);
            }
            const ids = await storage.getGlobalIDsByCPO(accounts[0]);
            expect(ids.length).to.equal(1);
        });

    });




});