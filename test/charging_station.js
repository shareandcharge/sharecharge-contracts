const crypto = require('crypto');
const { expectedEvent, assertError } = require('./helpers');

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
        await stations.setChargingContractAddress(charging.address);
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

    context('Request Charging Start', () => {

        it('Should log the correct event details when start requested', async () => {
            await registerConnector(connector, true, true);

            await charging.requestStart(connector, { from: controller });

            return expectedEvent(charging.StartRequested, (args) => {
                assert.equal(args.connectorId, connector);
                assert.equal(args.controller, controller);
            });
        });

        it('Should not allow a start request if connector not available', async () => {
            await registerConnector(connector, false, true);

            assertError(() => charging.requestStart(connector, { from: controller }));
        });

        it('Should not allow a start request on an unverified connector', (done) => {
            assertError(() => charging.requestStart(connector, { from: controller }), done);
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
            registerConnector(connector, true, true)
                .then(() => charging.requestStart(connector, { from: controller })
                .then(() => assertError(() => charging.confirmStart(connector, controller, { from: accounts[2] }), done)));
        });

        it('Should set connector to unavailable on start confirmation', async () => {
            await registerConnector(connector, true, true);
            await charging.requestStart(connector, { from: controller });
            await charging.confirmStart(connector, controller);

            assert.equal(await stations.isAvailable(connector), false);
        });

    });

    context('Request Charging Stop', () => {

        it('Should log the correct event details when stop requested', async() => {

            await registerConnector(connector, true, true);
            await charging.requestStart(connector, { from: controller });
            // NOTE: No start confirmation needed to request stop
            await charging.requestStop(connector, { from: controller });

            return expectedEvent(charging.StopRequested, (args) => {
                assert.equal(args.connectorId, connector);
                assert.equal(args.controller, controller);
            });

        });

        it('Should fail if stop requested on connector by controller not in current session', (done) => {
            registerConnector(connector, true, true)
                .then(() => charging.requestStart(connector, { from: controller }))
                .then(() => charging.confirmStart(connector, controller))
                .then(() => assertError(() => charging.requestStop(connector, { from: accounts[2] }), done));
        });

    });

    context.only('Confirm Charging Stop', () => {

        it('Should log event with correct details if stop confirmed successfully', async () => {
            await registerConnector(connector, true, true);
            await charging.confirmStop(connector);
            
            assert.equal(await stations.isAvailable(connector), true);
            return expectedEvent(charging.StopConfirmed, (args) => {
                assert.equal(args.connectorId, connector);
                // assert.equal(args.controller, controller);
            });
        });

    });
});
