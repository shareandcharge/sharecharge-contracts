const crypto = require('crypto');

const ChargingStation = artifacts.require("./ChargingStation.sol");
const ChargingStationStorage = artifacts.require("./ChargingStationStorage.sol");

contract('ChargingStation', (accounts) => {

  let charging, stations;
  let connector, controller, parameters;

  beforeEach(async () => {
    stations = await ChargingStationStorage.new();
    charging = await ChargingStation.new(stations.address);
    connector = '0x' + crypto.randomBytes(32).toString('hex');
    controller = accounts[1];
    parameters = JSON.stringify({secondsToRent: 1800, price: 5});  
    await stations.setConnector(connector, true);
    await stations.verifyConnector(connector);    
  })

  context('Request Charging Start', () => {

    it('Should log the correct event details when start called', async () => {
      
      await charging.requestStart(connector, controller, parameters);
      
      return new Promise((resolve, reject) => {
        const startEventListener = charging.StartRequested({}, (err, res) => {
          const args = res.args;
          assert.equal(args.connectorId, connector);
          assert.equal(args.controller, controller);
          assert.equal(args.parameters, parameters);
          startEventListener.stopWatching();      
          resolve();
        });  
      });
    });
  
    it('Should not allow a start request if connector not available', async () => {
      await stations.setConnector(connector, false);
  
      charging.requestStart(connector, controller, parameters)
        .then(res => assert.fail())
        .catch(err => assert.equal(err.message, 'VM Exception while processing transaction: revert'));
    });
  
    it('Should not allow a start request on an unverified connector', (done) => {
      const connector2 = '0x' + crypto.randomBytes(32).toString('hex');

      charging.requestStart(connector2, controller, parameters)
        .then(res => assert.fail())
        .catch(err => {
          assert.equal(err.message, 'VM Exception while processing transaction: revert');
          done();
        });

    });
  
  });


});
