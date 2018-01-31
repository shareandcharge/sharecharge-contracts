const { assertError, connector } = require('./helpers');

const ChargingSessions = artifacts.require("./ChargingSessions.sol");

contract('ChargingSessions', (accounts) => {

    let sessions;
    let contractAddress;

    beforeEach(async () => {
        sessions = await ChargingSessions.new();
        contractAddress = accounts[2];
    });

    it('Should fail if charging contract address is set by any account other than owner', (done) => {
        assertError(() => sessions.setAccess(contractAddress, { from: accounts[1] }), done);
    });

    it('Should fail if setter not called by address with restricted access', (done) => {
        sessions.setAccess(contractAddress).then(() => {
            assertError(() => sessions.set(connector, accounts[0], { from: accounts[1] }), done);
        });
    });

});
