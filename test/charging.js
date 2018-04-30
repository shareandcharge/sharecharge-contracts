const Charging = artifacts.require('./Charging.sol');
const ExternalStorage = artifacts.require('./ExternalStorage.sol');
const MSPToken = artifacts.require('./MSPToken.sol');

const helpers = require('./helpers');

contract('Charging', function (accounts) {

    let store, token, charging;

    beforeEach(async () => {
        store = await ExternalStorage.new();
        token = await MSPToken.new("MSPToken", "MSP");
        charging = await Charging.new();
        charging.setStorageAddress(store.address);
        // store.setAccess(charging.address);
        token.setAccess(charging.address);
    });


    async function addLocation(owner) {
        const scId = helpers.randomBytes32String();
        const evseId = "FR138E1ETG5578567YU8D";
        await store.addLocation(scId, evseId, { from: owner });
        return { scId, evseId };
    }

    it.skip('should not allow request start on unregistered location', async () => {
        await token.mint(accounts[1], 500);
        const id = () => helpers.randomBytes32String();
        try {
            await charging.requestStart(id(), id(), token.address, 100, { from: accounts[1] });
            expect.fail();
        } catch (err) {
            expect(err.message.search('revert') != -1).to.equal(true);            
        }
    });

    it.skip('should only allow owner to call confirmation functions', async () => {
        await token.mint(accounts[1], 500);
        const { scId, evseId } = await addLocation(accounts[0]);
        const charge = await charging.requestStart(scId, evseId, token.address, 100, { from: accounts[1] });

        try {
            await charging.confirmStart(scId, evseId, helpers.randomBytes32String(), { from: accounts[1] });
            expect.fail();
        } catch (err) {
            expect(err.message.search('revert') != -1).to.equal(true);
        }
    });

    it('should emit charge detail record event at end of charging session', async () => {

        await token.mint(accounts[1], 500);

        const balanceBefore = await token.balanceOf(accounts[1]);
        expect(balanceBefore.toNumber()).to.equal(500);
        
        const { scId, evseId } = await addLocation(accounts[0]);
        
        const requestStart = await charging.requestStart(scId, evseId, token.address, 200, { from: accounts[1] });
        console.log('requestStart gas:', requestStart.receipt.gasUsed);

        const allowance = await token.allowance(accounts[1], charging.address);
        expect(allowance.toNumber()).to.equal(200);

        const sessionId = helpers.randomBytes32String();
        const confirmStart = await charging.confirmStart(scId, evseId, sessionId, { from: accounts[0] });
        console.log('confirmStart gas:', confirmStart.receipt.gasUsed);

        // check allowance has been expended after token transfer
        const allowance2 = await token.allowance(accounts[1], charging.address);
        expect(allowance2.toNumber()).to.equal(0);

        // charged 10kw over 2 hours
        const confirmStop = await charging.confirmStop(scId, evseId, { from: accounts[0] });
        console.log('confirmStop gas:', confirmStop.receipt.gasUsed);
        
        const cdr = await charging.chargeDetailRecord(scId, evseId, 200, Date.now());
        console.log('chargeDetailRecord gas:', cdr.receipt.gasUsed);

        const balanceAfter = await token.balanceOf(accounts[1]);
        expect(balanceAfter.toNumber()).to.equal(300);

        const balanceEvseOwner = await token.balanceOf(accounts[0]);
        expect(balanceEvseOwner.toNumber()).to.equal(200);

        const cdrEvent = cdr.logs.filter(log => log.event === 'ChargeDetailRecord');
        expect(cdrEvent.length).to.equal(1);
        expect(cdrEvent[0].args.controller).to.equal(accounts[1]);
        expect(cdrEvent[0].args.finalPrice.toNumber()).to.equal(200);    
    });

    it('Should correctly refund driver tokens upon early stop', async () => {
        await token.mint(accounts[1], 500);
        const { scId, evseId } = await addLocation(accounts[0]);

        await charging.requestStart(scId, evseId, token.address, 300, { from: accounts[1] });

        const sessionId = helpers.randomBytes32String();
        await charging.confirmStart(scId, evseId, sessionId, { from: accounts[0] });        

        const balanceControllerBefore = await token.balanceOf(accounts[1]);
        expect(balanceControllerBefore.toNumber()).to.equal(200);

        await charging.confirmStop(scId, evseId, { from: accounts[0] });
        
        const result = await charging.chargeDetailRecord(scId, evseId, 225, Date.now());
        
        const balanceControllerAfter = await token.balanceOf(accounts[1]);
        expect(balanceControllerAfter.toNumber()).to.equal(275);
        const balanceEvseOwner = await token.balanceOf(accounts[0]);
        expect(balanceEvseOwner.toNumber()).to.equal(225);

        const cdrEvent = result.logs.filter(log => log.event === 'ChargeDetailRecord');
        expect(cdrEvent.length).to.equal(1);
        expect(cdrEvent[0].args.finalPrice.toNumber()).to.equal(225); 
    });

});
