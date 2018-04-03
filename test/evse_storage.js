const EvseStorage = artifacts.require("./EvseStorage.sol");

const helpers = require('./helpers');

contract('EvseStorage', function (accounts) {

    let storage;

    async function createEvse(owner) {
        const id = helpers.randomBytes32String();
        const uid = "FR138E1ETG5578567YU8D";
        const stationId = "0x123456789abcdef";
        const currency = "EUR";
        const basePrice = "150";
        const tariffId = 1
        const available = true;
        await storage.create(id, uid, stationId, currency, basePrice, tariffId, available, { from: owner });
        return id;
    }

    beforeEach(async () => {
        storage = await EvseStorage.new();
    });

    it('should add an evse', async () => {
        const id = await createEvse(accounts[0]);
        const evse = await storage.getById(id);
        expect(evse[0]).to.equal(id);
        expect(web3.toUtf8(evse[1])).to.equal('FR138E1ETG5578567YU8D');
        expect(evse[2]).to.equal(accounts[0]);
        expect(evse[3]).to.equal("0x123456789abcdef0000000000000000000000000000000000000000000000000");
        expect(web3.toUtf8(evse[4])).to.equal("EUR");
        expect(evse[5].toNumber()).to.equal(150);
        expect(evse[6].toNumber()).to.equal(1);
        expect(evse[7]).to.equal(true);
        expect(evse[8]).to.equal("0x0000000000000000000000000000000000000000");
        
    });

    it('should update an evse', async () => {
        const id = await createEvse(accounts[0]);

        await storage.update(id, "GB238E1ETG5578567YU8D", "0x01", "GBP", 300, 2, false);

        const evse = await storage.getById(id);
        expect(evse[0]).to.equal(id);
        expect(web3.toUtf8(evse[1])).to.equal("GB238E1ETG5578567YU8D");
        expect(evse[2]).to.equal(accounts[0]);
        expect(evse[3]).to.equal("0x0100000000000000000000000000000000000000000000000000000000000000");
        expect(web3.toUtf8(evse[4])).to.equal("GBP");
        expect(evse[5].toNumber()).to.equal(300);
        expect(evse[6].toNumber()).to.equal(2);
        expect(evse[7]).to.equal(false);
    });

    it('should only allow owner to update an evse', async () => {
        const id = await createEvse(accounts[0]);
        let threw = false;
        try {
            await storage.update(id, "0x01", 3, false, { from: accounts[1] });
        } catch (err) {
            threw = true;
        }
        expect(threw).to.equal(true);
    });

    it('should return all evses of given station', async () => {
        await storage.create("0x0", "GB238E1ETG5578567YU8D", "0x01", "EUR", 600, 1, true);
        await storage.create("0x1", "GB239E1ETG5578567YU8D", "0x01", "EUR", 600, 2, true);
        await storage.create("0x2", "GB23AE1ETG5578567YU8D", "0x01", "EUR", 600, 5, true);
        await storage.create("0x3", "GB23BE1ETG5578567YU8D", "0x06", "EUR", 600, 5, true);

        let result = await storage.getIdsByStation("0x01");
        assert.equal(result.length, 3);

        result = await storage.getIdsByStation("0x06");
        assert.equal(result.length, 1);
    });

    it('should report false if all evses are not available', async () => {
        await storage.create("0x01", "GB238E1ETG5578567YU8D", "0x01", "EUR", 200, 0, false);
        await storage.create("0x02", "GB239E1ETG5578567YU8D", "0x01", "EUR", 200, 0, false);
        await storage.create("0x03", "GB23AE1ETG5578567YU8D", "0x01", "EUR", 200, 0, false);
        await storage.create("0x04", "GB23BE1ETG5578567YU8D", "0x01", "EUR", 200, 0, false);

        const result = await storage.getStationAvailability("0x01");

        assert.equal(result, false);
    });

    it('should report true if any evses are available', async () => {
        await storage.create("0x01", "GB238E1ETG5578567YU8D", "0x01", "EUR", 500, 0, false);
        await storage.create("0x02", "GB239E1ETG5578567YU8D", "0x01", "EUR", 500, 0, false);
        await storage.create("0x03", "GB23AE1ETG5578567YU8D", "0x01", "EUR", 500, 0, true);
        await storage.create("0x04", "GB23BE1ETG5578567YU8D", "0x01", "EUR", 500, 0, false);

        const result = await storage.getStationAvailability("0x01");

        assert.equal(result, true);
    });

    it('should return an evse for a given cpo provided uid', async () => {
        const id = helpers.randomBytes32String();
        await storage.create(id, "GB238E1ETG5578567YU8D", "0x01", "EUR", 500, 0, false);

        const result = await storage.getByUid("GB238E1ETG5578567YU8D");

        expect(result[0]).to.equal(id);
        expect(web3.toUtf8(result[1])).to.equal("GB238E1ETG5578567YU8D");
    });

});
