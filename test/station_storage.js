const StationStorage = artifacts.require("./StationStorage.sol");

const helpers = require('./helpers');

contract('StationStorage', function (accounts) {

    let stations;

    async function createStation(owner) {
        const id = helpers.randomBytes32String();
        const latitude = 51345000;
        const longitude = -9233200;
        const openingHours = '0x3030303030303030303030303030303030303030303030303030303000000000';

        const create = await stations.create(id, latitude, longitude, openingHours, { from: owner });
        console.log(create.receipt.gasUsed);
        return id;
    }

    beforeEach(async () => {
        stations = await StationStorage.new();
    });

    it('should add a station', async () => {
        const id = await createStation(accounts[0]);
        // await createStation(accounts[0]);

        const stationsCount = await stations.getTotal();
        const stationValues = await stations.getById(id);

        expect(stationsCount.toNumber()).to.equal(1);
        expect(stationValues.length).to.equal(5);
        expect(stationValues[1]).to.equal(accounts[0]);
        expect(stationValues[2].toNumber()).to.equal(51345000);
        expect(stationValues[3].toNumber()).to.equal(-9233200);
        expect(stationValues[4]).to.equal("0x3030303030303030303030303030303030303030303030303030303000000000");

        return helpers.expectedEvent(stations.StationCreated, (values) => {
            expect(values.stationId).to.equal(id);
        });
    });

    it('should update a station', async () => {
        const id = await createStation(accounts[0]);
        await stations.update(id, 2, 3, "0x1020304030303030303030303030303030303030303030303030303000000000");

        const station = await stations.getById(id);

        expect(station[0]).to.equal(id);
        expect(station[1]).to.equal(accounts[0]);
        expect(station[2].toNumber()).to.equal(2);
        expect(station[3].toNumber()).to.equal(3);
        expect(station[4]).to.equal("0x1020304030303030303030303030303030303030303030303030303000000000");
    });

    it('should only allow owner to update a station', async () => {
        const id = await createStation(accounts[0]);
        let threw = false;
        try {
            await stations.update(id, 2, 3, "0x1020304030303030303030303030303030303030303030303030303000000000", { from: accounts[1] });
        } catch (err) {
            threw = true;
        }
        expect(threw).to.equal(true);
    });

});
