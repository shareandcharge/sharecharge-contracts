const Charging = artifacts.require('./Charging.sol');
const EvseStorage = artifacts.require('./EvseStorage.sol');
const MSPToken = artifacts.require('./MSPToken.sol');

const helpers = require('./helpers');

contract('Charging', function (accounts) {

    let evse, token, charging;

    beforeEach(async () => {
        evse = await EvseStorage.new();
        token = await MSPToken.new("MSPToken", "MSP");
        charging = await Charging.new();
        charging.setEvsesAddress(evse.address);
        charging.setTokenAddress(token.address);
        evse.setAccess(charging.address);
        token.setAccess(charging.address);
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

        await token.mint(accounts[1], 5);

        const balanceBefore = await token.balanceOf(accounts[1]);
        expect(balanceBefore.toNumber()).to.equal(5);

        const evseId = await createEvse(accounts[0]);
        const start = Date.now();

        await charging.requestStart(evseId, 5000, 0, { from: accounts[1] });
        await charging.confirmStart(evseId, accounts[1], { from: accounts[0] });

        const result = await charging.confirmStop(evseId, accounts[1], start, start + 5000, 18000, { from: accounts[0] });

        const balanceAfter = await token.balanceOf(accounts[1]);
        expect(balanceAfter.toNumber()).to.equal(4);

        const balanceEvseOwner = await token.balanceOf(accounts[0]);
        expect(balanceEvseOwner.toNumber()).to.equal(1);

        const cdrEvent = result.logs.filter(log => log.event === 'ChargeDetailRecord');
        expect(cdrEvent.length).to.equal(1);
        expect(cdrEvent[0].args.controller).to.equal(accounts[1]);
    });


});
