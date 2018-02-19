const { expectedEvent, assertError, connector, client } = require('./helpers');

const ChargingStation = artifacts.require("./ChargingStation.sol");
const StationStorage = artifacts.require("./StationStorage.sol");
const EVCoin = artifacts.require("./EVCoin.sol");

contract('ChargingStation', (accounts) => {

    let charging, stations, sessions, coin;
    let controller = accounts[1]
    let registerParams = Object.values(connector);
    let emptyAddress = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
        stations = await StationStorage.new();
        coin = await EVCoin.new(1000);
        charging = await ChargingStation.new(stations.address, coin.address);
        await stations.setAccess(charging.address);
        await coin.setAccess(charging.address);
    });

    async function startCharging() {

        await charging.registerConnector(...registerParams);
        await coin.mint(controller, 1);
        await charging.requestStart(connector.id, { from: controller });
        await charging.confirmStart(connector.id, controller);        
    }

    context('#registerConnector()', () => {
        it('should register connector with correct paramaters', async () => {
            await charging.registerConnector(...registerParams);
            const res = await stations.connectors(connector.id);
            const id = await stations.ids(0);
            assert.equal(res[0], connector.client);
            assert.equal(id, connector.id);
        });
    });

    context('#setAvailability()', () => {
        it('Should fail if called with different clientId', (done) => {
            charging.registerConnector(...registerParams)
                .then(() => assertError(() => charging.setAvailability('0x01', connector.id, false, { from: accounts[2] }), done));
        });
    });

    context('#requestStart()', () => {
        
        it('Should log correct StartRequested details when start requested', async () => {
            await charging.registerConnector(...registerParams);
            await coin.mint(controller, 1);
            await charging.requestStart(connector.id, { from: controller });

            return expectedEvent(charging.StartRequested, (args) => {
                assert.equal(args.connectorId, connector.id);
                assert.equal(args.controller, controller);
            });
        });

        it('Should approve and transfer when start requested', async () => {
            await charging.registerConnector(...registerParams);
            await coin.mint(controller, 1);
            await charging.requestStart(connector.id, { from: controller });

            const user = await coin.balanceOf(controller);
            const escrow = await coin.balanceOf(charging.address);
            assert.equal(user.toNumber(), 0);
            assert.equal(escrow.toNumber(), 1);

            return expectedEvent(coin.Approval, (args) => {
                assert.equal(args.owner, controller);
                assert.equal(args.spender, charging.address);
            });

        });

        it('Should not allow a start request if connector not available', async () => {
            registerParams.isAvailable = false;
            await charging.registerConnector(...registerParams);

            assertError(() => charging.requestStart(connector.id, { from: controller }));
        });

    });

    context('#confirmStart()', () => {

        it('Should log event details if start confirmed successfully', async () => {
            await startCharging();

            return expectedEvent(charging.StartConfirmed, (args) => {
                assert.equal(args.connectorId, connector.id);
            });
        });

        it('Should fail if start not previously requested by controller in confirmStart parameter', (done) => {
            charging.registerConnector(...registerParams)
                .then(() => assertError(() => charging.confirmStart(connector.id, controller), done));
        });

        it('Should fail if confirm start not called by connector owner', (done) => {
            charging.registerConnector(...registerParams)            
                .then(() => coin.mint(controller, 1))
                    .then(() => charging.requestStart(connector.id, { from: controller })
                    .then(() => assertError(() => charging.confirmStart(connector.id, controller, { from: accounts[2] }), done)));
        });

        it('Should set connector to unavailable on start confirmation', async () => {
            await startCharging();
            assert.equal(await charging.isAvailable(connector.id), false);
        });

    });

    context('#requestStop()', () => {

        it('Should log the correct event details when stop requested', async() => {

            await startCharging();
            await charging.requestStop(connector.id, { from: controller });

            return expectedEvent(charging.StopRequested, (args) => {                                
                assert.equal(args.connectorId, connector.id);
            });

        });

        it('Should fail if stop requested on connector by controller not in current session', (done) => {
            startCharging()
                .then(() => assertError(() => charging.requestStop(connector.id, { from: accounts[2] }), done));
        });

    });

    context('#confirmStop()', () => {

        it('Should log StopConfirmed if stop confirmed successfully', async () => {
            await startCharging();
            await charging.confirmStop(connector.id);
            
            return expectedEvent(charging.StopConfirmed, (args) => {
                assert.equal(args.connectorId, connector.id);
            });
        });

        it('Should transfer from escrow and reset state if stop confirmed successfully', async () => {
            await startCharging();
            await charging.confirmStop(connector.id);

            assert.equal(await stations.isAvailable(connector.id), true);
            assert.equal(await stations.getSession(connector.id), emptyAddress);
            const ownerBalance = await coin.balanceOf(accounts[0]);
            assert.equal(ownerBalance.toNumber(), 1001);
        });

        it('Should fail if confirm stop not called by connector owner', (done) => {
            charging.registerConnector(...registerParams)
                .then(() => assertError(() => charging.confirmStop(connector.id, { from: accounts[2] }), done));
        });

    });

    context('#logError()', () => {

        it('Should log event and return tokens on start failure', async () => {
            await charging.registerConnector(...registerParams);
            await coin.mint(controller, 1);
            await charging.requestStart(connector.id, { from: controller });
            await charging.logError(connector.id, 0);
            const balance = await coin.balanceOf(controller);
            assert.equal(balance, 1);
            return expectedEvent(charging.Error, (args) => {
                assert.equal(args.connectorId, connector.id);
                assert.equal(args.errorCode.toNumber(), 0);
            });
        });

        it('Should fail if log error not called by connector owner', (done)  => {
            charging.registerConnector(...registerParams)
                .then(() => assertError(() => charging.logError(connector.id, 0, { from: accounts[2] }), done));
        });

    });
});
