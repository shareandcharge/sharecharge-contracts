const ConnectorStorage = artifacts.require('./ConnectorStorage.sol');
const helpers = require('./helpers');

contract('ConnectorStorage', function (accounts) {

    it('should insert a new connector', async () => {
        const storage = await ConnectorStorage.new();

        const id = helpers.randomBytes32String();
        const evseId = helpers.randomBytes32String();
        const standard = helpers.randomInt(0, 16);
        const powerType = helpers.randomInt(0, 2);
        const voltage = helpers.randomInt(50, 400);
        const amperage = helpers.randomInt(8, 32);
        await storage.create(id, evseId, standard, powerType, voltage, amperage);

        const connector = await storage.getById(id);
        expect(connector[0]).to.equal(id);
        expect(connector[1]).to.equal(accounts[0]);
        expect(connector[2]).to.equal(evseId);
        expect(connector[3].toNumber()).to.equal(standard);
        expect(connector[4].toNumber()).to.equal(powerType);
        expect(connector[5].toNumber()).to.equal(voltage);
        expect(connector[6].toNumber()).to.equal(amperage);
    });

    it('should update a connector', async () => {
        const storage = await ConnectorStorage.new();

        const id = helpers.randomBytes32String();
        const evseId = helpers.randomBytes32String();
        await storage.create(id, '0x01', 0, 0, 400, 32);
        await storage.update(id, evseId, 1, 2, 800, 16);

        const connector = await storage.getById(id);
        expect(connector[0]).to.equal(id);
        expect(connector[1]).to.equal(accounts[0]);
        expect(connector[2]).to.equal(evseId);
        expect(connector[3].toNumber()).to.equal(1);
        expect(connector[4].toNumber()).to.equal(2);
        expect(connector[5].toNumber()).to.equal(800);
        expect(connector[6].toNumber()).to.equal(16);
    });

    it('should only allow the owner to update a connector', async () => {
        const storage = await ConnectorStorage.new();

        const id = helpers.randomBytes32String();
        await storage.create(id, '0x01', 0, 0, 400, 32);

        let thrown = false;
        try {
            await storage.update(id, '0x01', 1, 2, 800, 16, { from: accounts[1] });
        } catch (err) {
            thrown = true;
        }
        expect(thrown).to.be.true;
    });

    it('should return all connectors for a given evse', async () => {
        const storage = await ConnectorStorage.new();

        await storage.create('0x01', '0x01', 0, 0, 400, 32);
        await storage.create('0x02', '0x01', 0, 0, 400, 32);
        await storage.create('0x03', '0x01', 0, 0, 400, 32);
        await storage.create('0x04', '0x02', 0, 0, 400, 32);

        let result1 = await storage.getIdsByEvse('0x01');
        let result2 = await storage.getIdsByEvse('0x02');

        expect(result1.length).to.equal(3);
        expect(result2.length).to.equal(1);
    });

});
