const ConnectorStorage = artifacts.require("./ConnectorStorage.sol");

contract('ConnectorStorage', function (accounts) {

    it('should return all connectors of given station', async () => {
        const storage = await ConnectorStorage.new();

        await storage.addConnector("0x0", "0x01", "0x01", 1, true);
        await storage.addConnector("0x0", "0x02", "0x01", 2, true);
        await storage.addConnector("0x0", "0x03", "0x01", 5, true);
        await storage.addConnector("0x0", "0x04", "0x06", 5, true);

        let result = await storage.getStationConnectors("0x01");
        assert.equal(result.length, 3);

        result = await storage.getStationConnectors("0x06");
        assert.equal(result.length, 1);

    });
});
