const crypto = require('crypto');

const ChargingStation = artifacts.require("./ChargingStation.sol");
const ChargingStationStorage = artifacts.require("./ChargingStationStorage.sol");

contract('ChargingStation', (accounts) => {

  let charging;
  let chargingStations;
  let connector;
  let user;

  beforeEach(async () => {
    chargingStations = await ChargingStationStorage.new();
    charging = await ChargingStation.new(chargingStations.address);
    connector = '0x' + crypto.randomBytes(32).toString('hex');
    user = accounts[1];  
    await chargingStations.setConnector(connector, true);
  })

  it('Should log the correct event details when start called', async () => {
    
    const result = await charging.requestStart(connector, user);
    
    return new Promise((resolve, reject) => {
      const startEventListener = charging.StartRequested({}, (err, res) => {
        const args = res.args;
        assert.equal(args.connectorId, connector);
        assert.equal(args.user, user);
        startEventListener.stopWatching();      
        resolve();
      });  
    });
  });

  it('Should not allow a start request if connector not available', async () => {
    await chargingStations.setConnector(connector, false);
    console.log(await chargingStations.connectors(connector));
    try {
      const result = await charging.requestStart(connector, user);
       throw new Error('Should have reverted contract call');
     } catch(err) {
       assert.equal(err.message, 'VM Exception while processing transaction: revert');
     }
  });

});
