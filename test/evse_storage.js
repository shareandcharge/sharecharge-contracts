const EvseStorage = artifacts.require("./EvseStorage.sol");

const helpers = require('./helpers');

contract('EvseStorage', function (accounts) {

    let storage;

    async function createEvse(owner) {
        const id = helpers.randomBytes32String();
        const stationId = "0x123456789abcdef";
        const plugMask = 1;
        const available = true;
        await storage.create(id, stationId, plugMask, available, { from: owner });
        return id;
    }

    beforeEach(async () => {
        storage = await EvseStorage.new();
    });

    it('should add an evse', async () => {
        const id = await createEvse(accounts[0]);
        const evse = await storage.getEvse(id);
        expect(evse[0]).to.equal(id);
        expect(evse[1]).to.equal(accounts[0]);
        expect(evse[2]).to.equal("0x123456789abcdef0000000000000000000000000000000000000000000000000");
        expect(evse[3].toNumber()).to.equal(1);
        expect(evse[4]).to.equal(true);
        expect(evse[5]).to.equal("0x0000000000000000000000000000000000000000");
    });

    it('should update an evse', async () => {
        const id = await createEvse(accounts[0]);

        await storage.update(id, "0x01", 3, false);

        const evse = await storage.getEvse(id);
        expect(evse[0]).to.equal(id);
        expect(evse[1]).to.equal(accounts[0]);
        expect(evse[2]).to.equal("0x0100000000000000000000000000000000000000000000000000000000000000");
        expect(evse[3].toNumber()).to.equal(3);
        expect(evse[4]).to.equal(false);
        expect(evse[5]).to.equal("0x0000000000000000000000000000000000000000");
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
        await storage.create("0x0", "0x01", 1, true);
        await storage.create("0x1", "0x01", 2, true);
        await storage.create("0x2", "0x01", 5, true);
        await storage.create("0x3", "0x06", 5, true);

        let result = await storage.getStationEvses("0x01");
        assert.equal(result.length, 3);

        result = await storage.getStationEvses("0x06");
        assert.equal(result.length, 1);
    });

    it('should report false if all evses are not available', async () => {
        await storage.create("0x01", "0x01", 0, false);
        await storage.create("0x02", "0x01", 0, false);
        await storage.create("0x03", "0x01", 0, false);
        await storage.create("0x04", "0x01", 0, false);

        const result = await storage.getStationAvailability("0x01");

        assert.equal(result, false);
    });

    it('should report true if any evses are available', async () => {
        await storage.create("0x01", "0x01", 0, false);
        await storage.create("0x02", "0x01", 0, false);
        await storage.create("0x03", "0x01", 0, true);
        await storage.create("0x04", "0x01", 0, false);

        const result = await storage.getStationAvailability("0x01");

        assert.equal(result, true);
    });

});
