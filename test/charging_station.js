const crypto = require('crypto');

const ChargingStation = artifacts.require("./ChargingStation.sol");
const ChargingStationStorage = artifacts.require("./ChargingStationStorage.sol");

contract('ChargingStation', (accounts) => {

  let charging;
  let chargingStations;
  let connector;
  let controller;

  beforeEach(async () => {
    chargingStations = await ChargingStationStorage.new();
    charging = await ChargingStation.new(chargingStations.address);
    connector = '0x' + crypto.randomBytes(32).toString('hex');
    controller = accounts[1];  
    await chargingStations.setConnector(connector, true);
  })

  context('Request Charging Start', () => {

    it('Should log the correct event details when start called', async () => {
      
      await charging.requestStart(connector, controller);
      
      return new Promise((resolve, reject) => {
        const startEventListener = charging.StartRequested({}, (err, res) => {
          const args = res.args;
          assert.equal(args.connectorId, connector);
          assert.equal(args.controller, controller);
          startEventListener.stopWatching();      
          resolve();
        });  
      });
    });
  
    it('Should not allow a start request if connector not available', async () => {
      await chargingStations.setConnector(connector, false);
  
      charging.requestStart(connector, controller)
        .then(res => assert.fail())
        .catch(err => assert.equal(err.message, 'VM Exception while processing transaction: revert'));
    });
  
    it('Should ')
  
  });


});
