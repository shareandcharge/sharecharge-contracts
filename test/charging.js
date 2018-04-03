const Charging = artifacts.require('./Charging.sol');
const EvseStorage = artifacts.require('./EvseStorage.sol');

const helpers = require('./helpers');

contract('Charging', function (accounts) {

    let evse, charging;

    beforeEach(async () => {
        evse = await EvseStorage.new();
        charging = await Charging.new();
        charging.setEvsesAddress(evse.address);
        evse.setAccess(charging.address);
    });

    async function createEvse(owner) {
        const id = helpers.randomBytes32String();
        const uid = "FR138E1ETG5578567YU8D";
        const stationId = "0x123456789abcdef";
        const currency = "EUR";
        const basePrice = "150";
        const tariffId = 1
        const available = true;
        await evse.create(id, uid, stationId, currency, basePrice, tariffId, available, { from: owner });
        return id;
    }

    it('should emit charge detail record event at end of charging session', async () => {

        const evseId = await createEvse(accounts[0]);
        const start = Date.now();

        await charging.requestStart(evseId, 5000, 0, { from: accounts[1] });
        await charging.confirmStart(evseId, accounts[1], { from: accounts[0] });

        const result = await charging.confirmStop(evseId, accounts[1], start, start + 5000, 18000, { from: accounts[0] });

        const cdrEvent = result.logs.filter(log => log.event === 'ChargeDetailRecord');
        expect(cdrEvent.length).to.equal(1);
        expect(cdrEvent[0].args.controller).to.equal(accounts[1]);
    });

});
