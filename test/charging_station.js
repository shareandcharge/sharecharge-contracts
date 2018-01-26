const crypto = require('crypto');

const ChargingStation = artifacts.require("./ChargingStation.sol");
const ChargingStationStorage = artifacts.require("./ChargingStationStorage.sol");
const ChargingSessions = artifacts.require("./ChargingSessions.sol");

contract('ChargingStation', (accounts) => {

  let charging, stations, sessions;
  let connector, controller, parameters;

  beforeEach(async () => {
    stations = await ChargingStationStorage.new();
    sessions = await ChargingSessions.new();
    charging = await ChargingStation.new(stations.address, sessions.address);
    await sessions.setChargingContractAddress(charging.address);
    connector = '0x' + crypto.randomBytes(32).toString('hex');
    controller = accounts[1];
    parameters = JSON.stringify({ secondsToRent: 1800, price: 5 });
  })

  async function registerConnector(connector, isAvailable, isVerified) {
    await stations.registerConnector(connector, isAvailable);
    if (isVerified) {
      await stations.verifyConnector(connector);
    }
  };

  function expectedEvent(targetEvent, callback) {
    return new Promise((resolve, reject) => {
      const eventListener = targetEvent({}, (err, res) => {
        callback(res.args);
        eventListener.stopWatching();
        resolve();
      });
    });
  }

  context('Request Charging Start', () => {

    it('Should log the correct event details when start called', async () => {
      await registerConnector(connector, true, true);

      await charging.requestStart(connector, { from: controller });

      return expectedEvent(charging.StartRequested, (args) => {
        assert.equal(args.connectorId, connector);
        assert.equal(args.controller, controller);
      });
    });

    it('Should not allow a start request if connector not available', async () => {
      await registerConnector(connector, false, true);

      charging.requestStart(connector, { from: controller })
        .then(res => assert.fail())
        .catch(err => assert.equal(err.message, 'VM Exception while processing transaction: revert'));
    });

    it('Should not allow a start request on an unverified connector', (done) => {
      charging.requestStart(connector, { from: controller })
        .then(res => assert.fail())
        .catch(err => {
          assert.equal(err.message, 'VM Exception while processing transaction: revert');
          done();
        });
    });

  });

  context('Confirm Charging Start', () => {

    it('Should log event with correct details if start confirmed successfully', async () => {
      await registerConnector(connector, true, true);

      await charging.requestStart(connector, { from: controller });
      await charging.confirmStart(connector, controller);

      return expectedEvent(charging.StartConfirmed, (args) => {
        assert.equal(args.connectorId, connector);
      });
    });

    it('Should only allow confirm start to be called if start previously executed on connector', async () => {
      await registerConnector(connector, true, true);

      await charging.requestStart(connector, { from: controller });
      await charging.confirmStart(connector, controller);
      
      return expectedEvent(charging.StartConfirmed, (args) => {
        assert.equal(args.connectorId, connector);
      }); 
    });

    it('Should fail if confirm start not called by connector owner', (done) => {
      registerConnector(connector, true, true).then(() => {
        charging.requestStart(connector, { from: controller }).then(() => {
          charging.confirmStart(connector, controller, { from: accounts[2] })
            .then(res => assert.fail())
            .catch(err => {
              assert.equal(err.message, 'VM Exception while processing transaction: revert')
              done();
            });
        });
      });
    })
  });
});
