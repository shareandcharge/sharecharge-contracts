const StationStorage = artifacts.require("./StationStorage.sol");

const helpers = require('./helpers');

contract('StationStorage', function (accounts) {

    let stations;

    beforeEach(async () => {
        stations = await StationStorage.new();
    });


    it('should add a station', async () => {

        const id = helpers.randomBytes32String();
        const owner = accounts[0];
        const latitude = 51345000;
        const longitude = -9233200;
        const openingHours = '0x3030303030303030303030303030303030303030303030303030303000000000';
        const available = true;

        await stations.addStation(id, owner, latitude, longitude, openingHours, available, { from: accounts[0] });

        const stationsCount = await stations.getNumberOfStations();
        const stationId = await stations.getIdByIndex(0);
        const station = await stations.getStation(id);
        
        expect(stationsCount.toNumber()).to.equal(1);
        expect(stationId).to.equal(id);
        expect(station.length).to.equal(6);
        expect(station[1]).to.equal(accounts[0]);
    });
    
});
