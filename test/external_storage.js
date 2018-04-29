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
            const ids = await storage.getShareAndChargeIdsByCPO(accounts[0]);
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
            const ids = await storage.getShareAndChargeIdsByCPO(accounts[0]);
            expect(ids.length).to.equal(1);
        });

    });

    context('#updateLocation()', () => {

        it('should update location', async () => {
            const loc = newLocation();
            await storage.addLocation(loc.id, loc.hash);
            const newHash = helpers.randomBytes32String();
            const tx = await storage.updateLocation(loc.id, newHash);
            console.log(tx.receipt.gasUsed);
            const storedHash = await storage.getLocationById(accounts[0], loc.id);
            expect(storedHash).to.equal(newHash);
        });

    });

    context('#addTariffs()', () => {

        it('should add tariffs to cpo', async () => {
            const tariffs = helpers.randomBytes32String();
            const tx = await storage.addTariffs(tariffs);
            console.log(tx.receipt.gasUsed);
            const storedHash = await storage.getTariffsByCPO(accounts[0]);
            expect(storedHash).to.equal(tariffs);
        });
    });

    context('#updateTariffs()', () => {

        it('should update tariffs for cpo', async () => {
            const tariffs = helpers.randomBytes32String();
            await storage.addTariffs(tariffs);
            const tariffs2 = helpers.randomBytes32String();
            const tx = await storage.updateTariffs(tariffs2);
            console.log(tx.receipt.gasUsed);
            const storedHash = await storage.getTariffsByCPO(accounts[0]);
            expect(storedHash).to.equal(tariffs2);
        });
    })

    context('#updateEvseAvailability()', () => {

        it('should emit event when evse changes status', async () => {
            const scId = helpers.randomBytes32String();
            const evseId = helpers.randomBytes32String();
            const result = await storage.updateEvseAvailability(scId, evseId, true);
            console.log(result.receipt.gasUsed);
            expect(result.logs.length).to.equal(1);
        });
    })

});