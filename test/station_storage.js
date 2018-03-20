const StationStorage = artifacts.require("./StationStorage.sol");

const helpers = require('./helpers');

contract('StationStorage', function (accounts) {

    let stations;

    async function addStation(owner) {
        const id = helpers.randomBytes32String();
        const latitude = 51345000;
        const longitude = -9233200;
        const openingHours = '0x3030303030303030303030303030303030303030303030303030303000000000';

        await stations.addStation(id, owner, latitude, longitude, openingHours, { from: owner });
        return id;
    }

    beforeEach(async () => {
        stations = await StationStorage.new();
    });

    it('should add a station', async () => {
        const id = await addStation(accounts[0]);

        const stationsCount = await stations.getNumberOfStations();
        const stationId = await stations.getIdByIndex(0);
        const stationValues = await stations.getStation(id);

        expect(stationsCount.toNumber()).to.equal(1);
        expect(stationId).to.equal(id);
        expect(stationValues.length).to.equal(5);
        expect(stationValues[1]).to.equal(accounts[0]);

        return helpers.expectedEvent(stations.StationCreated, (values) => {
            expect(values.stationId).to.equal(id);
        });
    });

});
