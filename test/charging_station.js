const crypto = require('crypto');
const { expectedEvent, assertError } = require('./helpers');

const ChargingStation = artifacts.require("./ChargingStation.sol");
const ChargingStationStorage = artifacts.require("./ChargingStationStorage.sol");
const ChargingSessions = artifacts.require("./ChargingSessions.sol");
const EVCoin = artifacts.require("./EVCoin.sol");

contract('ChargingStation', (accounts) => {

    let charging, stations, sessions, coin;
    let connector, controller;
    let emptyAddress = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
        stations = await ChargingStationStorage.new();
        sessions = await ChargingSessions.new();
        coin = await EVCoin.new(1000);
        charging = await ChargingStation.new(stations.address, sessions.address, coin.address);
        await sessions.setChargingContractAddress(charging.address);
        await stations.setChargingContractAddress(charging.address);
        connector = '0x' + crypto.randomBytes(32).toString('hex');
        controller = accounts[1];
    });

    async function registerConnector(connector, isAvailable, isVerified) {
        await stations.registerConnector(connector, isAvailable);
        if (isVerified) {
            await stations.verifyConnector(connector);
        }
    };

    context('#requestStart()', () => {

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

    context('#confirmStart()', () => {

        it('Should log event details and transfer to escrow if start confirmed successfully', async () => {
            await registerConnector(connector, true, true);

            await charging.requestStart(connector, { from: controller });
            await coin.mint(controller, 1);
            await coin.approve(charging.address, 1, { from: controller });

            await charging.confirmStart(connector, controller);

            const escrowBalance = await coin.balanceOf(charging.address);
            assert.equal(escrowBalance.toNumber(), 1);

            return expectedEvent(charging.StartConfirmed, (args) => {
                assert.equal(args.connectorId, connector);
            });
        });

        it('Should only allow confirm start to be called if start previously executed on connector', async () => {
            await registerConnector(connector, true, true);

            await charging.requestStart(connector, { from: controller });
            await coin.mint(controller, 1);
            await coin.approve(charging.address, 1, { from: controller });

            await charging.confirmStart(connector, controller);

            return expectedEvent(charging.StartConfirmed, (args) => {
                assert.equal(args.connectorId, connector);
            });
        });

        it('Should fail if confirm start not called by connector owner', (done) => {
            registerConnector(connector, true, true)
                .then(() => charging.requestStart(connector, { from: controller })
                .then(() => coin.mint(controller, 1))
                .then(() => coin.approve(charging.address, 1, { from: controller }))
                .then(() => assertError(() => charging.confirmStart(connector, controller, { from: accounts[2] }), done)));
        });

        it('Should set connector to unavailable on start confirmation', async () => {
            await registerConnector(connector, true, true);
            await charging.requestStart(connector, { from: controller });
            await coin.mint(controller, 1);
            await coin.approve(charging.address, 1, { from: controller });
            await charging.confirmStart(connector, controller);

            assert.equal(await stations.isAvailable(connector), false);
        });

    });

    context('#requestStop()', () => {

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
                .then(() => coin.mint(controller, 1))
                .then(() => coin.approve(charging.address, 1, { from: controller }))
                .then(() => charging.confirmStart(connector, controller))
                .then(() => assertError(() => charging.requestStop(connector, { from: accounts[2] }), done));
        });

    });

    context('#confirmStop()', () => {

        it('Should log event with correct details and reset state if stop confirmed successfully', async () => {
            await registerConnector(connector, true, true);
            
            await charging.requestStart(connector, { from: controller });
            assert.equal(await sessions.get(connector), controller);
            
            await charging.confirmStop(connector);
            
            assert.equal(await stations.isAvailable(connector), true);
            assert.equal(await sessions.get(connector), emptyAddress);
            return expectedEvent(charging.StopConfirmed, (args) => {
                assert.equal(args.connectorId, connector);
            });
        });

        it('Should fail if confirm stop not called by connector owner', (done) => {
            registerConnector(connector, true, true)
                .then(() => assertError(() => charging.confirmStop(connector, { from: accounts[2] }), done));
        });

    });

    context('#logError()', () => {

        it('Should log event with error code on connector error', async () => {
            await registerConnector(connector, true, true);
            await charging.logError(connector, 1);
            return expectedEvent(charging.Error, (args) => {
                assert.equal(args.connectorId, connector);
                assert.equal(args.errorCode.toNumber(), 1);
            });
        });

        it('Should fail if log error not called by connector owner', (done)  => {
            registerConnector(connector, true, true)
                .then(() => assertError(() => charging.logError(connector, 1, { from: accounts[2] }), done));
        });

    });
});
