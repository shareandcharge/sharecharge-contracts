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


    // export enum Tariff {
    //     ENERGY,                 // charging tariff by kWh
    //     FLAT,                   // flat fee (also use if free of charge)
    //     PARKING_TIME,           // parking tariff by hours
    //     TIME                    // charging tariff by hours
    // }
    async function createEvse(owner, tariff = 1) {
        const id = helpers.randomBytes32String();
        const uid = "FR138E1ETG5578567YU8D";
        const stationId = "0x123456789abcdef";
        const currency = "EUR";
        const basePrice = "150";
        const tariffId = tariff;
        const available = true;
        await evse.create(id, uid, stationId, currency, basePrice, tariffId, available, { from: owner });
        return id;
    }

    it('should emit charge detail record event at end of charging session with correct flat rate fee', async () => {

        await token.mint(accounts[1], 500);

        const balanceBefore = await token.balanceOf(accounts[1]);
        expect(balanceBefore.toNumber()).to.equal(500);

        const evseId = await createEvse(accounts[0]);
        const start = Date.now();

        // flat rate charge
        await charging.requestStart(evseId, 0, 0, { from: accounts[1] });

        const allowance = await token.allowance(accounts[1], charging.address);
        expect(allowance.toNumber()).to.equal(150);

        await charging.confirmStart(evseId, { from: accounts[0] });

        // check allowance has been expended after token transfer
        const allowance2 = await token.allowance(accounts[1], charging.address);
        expect(allowance2.toNumber()).to.equal(0);

        // charged 10kw over 2 hours
        const result = await charging.confirmStop(evseId, start, start + 7200, 10000, { from: accounts[0] });

        const balanceAfter = await token.balanceOf(accounts[1]);
        expect(balanceAfter.toNumber()).to.equal(350);

        const balanceEvseOwner = await token.balanceOf(accounts[0]);
        expect(balanceEvseOwner.toNumber()).to.equal(150);

        const cdrEvent = result.logs.filter(log => log.event === 'ChargeDetailRecord');
        expect(cdrEvent.length).to.equal(1);
        expect(cdrEvent[0].args.controller).to.equal(accounts[1]);
        expect(cdrEvent[0].args.price.toNumber()).to.equal(150);        
    });

    it('should emit CDR and divvy up tokens correctly for time based charge', async () => {
        await token.mint(accounts[1], 500);
        const evseId = await createEvse(accounts[0], 3);
        const start = Date.now();
        const end = start + 5400;

        // driver pays for 2 hours
        await charging.requestStart(evseId, 7200, 0, { from: accounts[1] });

        await charging.confirmStart(evseId, { from: accounts[0] });        

        const balanceControllerBefore = await token.balanceOf(accounts[1]);
        expect(balanceControllerBefore.toNumber()).to.equal(200);

        // driver charges for 1.5 hours (5400 seconds)
        const result = await charging.confirmStop(evseId, start, end, 10000, { from: accounts[0] });

        const balanceControllerAfter = await token.balanceOf(accounts[1]);
        expect(balanceControllerAfter.toNumber()).to.equal(275);

        const balanceEvseOwner = await token.balanceOf(accounts[0]);
        expect(balanceEvseOwner.toNumber()).to.equal(225);

        const cdrEvent = result.logs.filter(log => log.event === 'ChargeDetailRecord');
        expect(cdrEvent.length).to.equal(1);
        expect(cdrEvent[0].args.price.toNumber()).to.equal(225); 
    });

    context('#calculatePrice()', function () {

        it('should not charge owner of evse', async () => {
            const evseId = await createEvse(accounts[0]);
            const price = await charging.calculatePrice(evseId, accounts[0], 0, 0);
            expect(price.toNumber()).to.equal(0);
        });

        it('should calculate price of flat rate charge', async () => {
            const evseId = await createEvse(accounts[0]);
            const price = await charging.calculatePrice(evseId, accounts[1], 0, 0);
            expect(price.toNumber()).to.equal(150);
        });

        it('should calculate price of time based charge', async () => {
            const evseId = await createEvse(accounts[0], 3);
            // charge for 1800 seconds (30 minutes)
            const price = await charging.calculatePrice(evseId, accounts[1], 1800, 0);
            // expect half the price of the base price per hour
            expect(price.toNumber()).to.equal(150 / 2);
        });

        it('should calculate price of kWh charge', async () => {
            const evseId = await createEvse(accounts[0], 0);
            // charge for 2 hours at a rate of 5 kWh 
            const price = await charging.calculatePrice(evseId, accounts[1], 7200, 5);
            // expect 150 * 5 (kwh) * 2 hours (15 eur or 1500 tokens)
            expect(price.toNumber()).to.equal(150 * 5 * 2);
        });

    });

});
