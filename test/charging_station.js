const { expectedEvent, assertError, connector, client } = require('./helpers');

const ChargingStation = artifacts.require("./ChargingStation.sol");
const StationStorage = artifacts.require("./StationStorage.sol");
const ChargingSessions = artifacts.require("./ChargingSessions.sol");
const EVCoin = artifacts.require("./EVCoin.sol");

contract('ChargingStation', (accounts) => {

    let charging, stations, sessions, coin;
    let controller;
    let emptyAddress = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
        stations = await StationStorage.new();
        sessions = await ChargingSessions.new();
        coin = await EVCoin.new(1000);
        charging = await ChargingStation.new(stations.address, sessions.address, coin.address);
        await sessions.setAccess(charging.address);
        await stations.setAccess(charging.address);
        await coin.setAccess(charging.address);
        controller = accounts[1];
    });

    async function registerConnector(client, connector, isAvailable, isVerified) {
        await stations.registerConnector(client, connector, isAvailable);
        if (isVerified) {
            await stations.verifyConnector(connector);
        }
    };

    async function startCharging() {
        await registerConnector(client, connector, true, true);
        await coin.mint(controller, 1);
        await charging.requestStart(connector, { from: controller });
        await charging.confirmStart(connector, controller);        
    }

    context('#requestStart()', () => {
        
        it('Should log correct StartRequested details when start requested', async () => {
            await registerConnector(client, connector, true, true);

            await charging.requestStart(connector, { from: controller });

            return expectedEvent(charging.StartRequested, (args) => {
                assert.equal(args.connectorId, connector);
                assert.equal(args.controller, controller);
            });
        });

        it('Should approve transfer when start requested', async () => {
            await registerConnector(client, connector, true, true);
            await charging.requestStart(connector, { from: controller });

            const allowance = await coin.allowance(controller, charging.address);
            assert.equal(allowance.toNumber(), 1);

            return expectedEvent(coin.Approval, (args) => {
                assert.equal(args.owner, controller);
                assert.equal(args.spender, charging.address);
            });

        });

        it('Should not allow a start request if connector not available', async () => {
            await registerConnector(client, connector, false, true);

            assertError(() => charging.requestStart(connector, { from: controller }));
        });

        it('Should not allow a start request on an unverified connector', (done) => {
            assertError(() => charging.requestStart(connector, { from: controller }), done);
        });

    });

    context('#confirmStart()', () => {

        it('Should log event details and transfer to escrow if start confirmed successfully', async () => {
            await startCharging();

            const escrowBalance = await coin.balanceOf(charging.address);
            assert.equal(escrowBalance.toNumber(), 1);

            return expectedEvent(charging.StartConfirmed, (args) => {
                assert.equal(args.connectorId, connector);
            });
        });

        it('Should fail if start not previously requested by controller in confirmStart parameter', (done) => {
            registerConnector(client, connector, true, true)
                .then(() => assertError(() => charging.confirmStart(connector, controller), done));
        });

        it('Should fail if confirm start not called by connector owner', (done) => {
            registerConnector(client, connector, true, true)
            .then(() => coin.mint(controller, 1))
                .then(() => charging.requestStart(connector, { from: controller })
                .then(() => assertError(() => charging.confirmStart(connector, controller, { from: accounts[2] }), done)));
        });

        it('Should set connector to unavailable on start confirmation', async () => {
            await startCharging();
            assert.equal(await stations.isAvailable(connector), false);
        });

    });

    context('#requestStop()', () => {

        it('Should log the correct event details when stop requested', async() => {

            await registerConnector(client, connector, true, true);
            await charging.requestStart(connector, { from: controller });
            // NOTE: No start confirmation needed to request stop
            await charging.requestStop(connector, { from: controller });

            return expectedEvent(charging.StopRequested, (args) => {                                
                assert.equal(args.connectorId, connector);
            });

        });

        it('Should fail if stop requested on connector by controller not in current session', (done) => {
            startCharging()
                .then(() => assertError(() => charging.requestStop(connector, { from: accounts[2] }), done));
        });

    });

    context('#confirmStop()', () => {

        it('Should log StopConfirmed if stop confirmed successfully', async () => {
            await startCharging();
            await charging.confirmStop(connector);
            
            return expectedEvent(charging.StopConfirmed, (args) => {
                assert.equal(args.connectorId, connector);
            });
        });

        it('Should transfer from escrow and reset state if stop confirmed successfully', async () => {
            await startCharging();
            await charging.confirmStop(connector);

            assert.equal(await stations.isAvailable(connector), true);
            assert.equal(await sessions.get(connector), emptyAddress);
            const ownerBalance = await coin.balanceOf(accounts[0]);
            assert.equal(ownerBalance.toNumber(), 1001);
        });

        it('Should fail if confirm stop not called by connector owner', (done) => {
            registerConnector(client, connector, true, true)
                .then(() => assertError(() => charging.confirmStop(connector, { from: accounts[2] }), done));
        });

    });

    context('#logError()', () => {

        it('Should log event with error code on connector error', async () => {
            await registerConnector(client, connector, true, true);
            await charging.logError(connector, 0);
            return expectedEvent(charging.Error, (args) => {
                assert.equal(args.connectorId, connector);
                assert.equal(args.errorCode.toNumber(), 0);
            });
        });

        it('Should fail if log error not called by connector owner', (done)  => {
            registerConnector(client, connector, true, true)
                .then(() => assertError(() => charging.logError(connector, 0, { from: accounts[2] }), done));
        });

    });
});
