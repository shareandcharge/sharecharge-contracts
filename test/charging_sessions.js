const crypto = require('crypto');
const { assertError } = require('./helpers');

const ChargingSessions = artifacts.require("./ChargingSessions.sol");

contract('ChargingSessions', (accounts) => {

    let sessions;
    let connector, contractAddress;

    beforeEach(async () => {
        sessions = await ChargingSessions.new();
        connector = '0x' + crypto.randomBytes(32).toString('hex');
        contractAddress = accounts[2];
    });

    it('Should fail if charging contract address is set by any account other than owner', (done) => {
        assertError(() => sessions.setChargingContractAddress(contractAddress, { from: accounts[1] }), done);
    });

    it('Should fail if setter not called by address with restricted access', (done) => {
        sessions.setChargingContractAddress(contractAddress).then(() => {
            assertError(() => sessions.set(connector, accounts[0], { from: accounts[1] }), done);
        });
    });

});
