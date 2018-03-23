const EvseStorage = artifacts.require("./EvseStorage.sol");

contract('EvseStorage', function (accounts) {

    it('should return all evses of given station', async () => {
        const storage = await EvseStorage.new();

        await storage.addEvse("0x0", "0x01", "0x01", 1, true);
        await storage.addEvse("0x0", "0x02", "0x01", 2, true);
        await storage.addEvse("0x0", "0x03", "0x01", 5, true);
        await storage.addEvse("0x0", "0x04", "0x06", 5, true);

        let result = await storage.getStationEvses("0x01");
        assert.equal(result.length, 3);

        result = await storage.getStationEvses("0x06");
        assert.equal(result.length, 1);
    });

    it('should report false if all evses are not available', async () => {
        const storage = await EvseStorage.new();

        await storage.addEvse("0x01", accounts[0], "0x01", 0, false);
        await storage.addEvse("0x02", accounts[0], "0x01", 0, false);
        await storage.addEvse("0x03", accounts[0], "0x01", 0, false);
        await storage.addEvse("0x04", accounts[0], "0x01", 0, false);

        const result = await storage.getStationAvailability("0x01");

        assert.equal(result, false);
    });

    it('should report true if any evses are available', async () => {
        const storage = await EvseStorage.new();

        await storage.addEvse("0x01", accounts[0], "0x01", 0, false);
        await storage.addEvse("0x02", accounts[0], "0x01", 0, false);
        await storage.addEvse("0x03", accounts[0], "0x01", 0, true);
        await storage.addEvse("0x04", accounts[0], "0x01", 0, false);

        const result = await storage.getStationAvailability("0x01");

        assert.equal(result, true);
    });
});
