const MSPTokenManager = artifacts.require("./MSPTokenManager.sol");
const MSPToken = artifacts.require('./MSPToken.sol');

contract.skip('MSPTokenManager', function (accounts) {

  let tokenManager;

  beforeEach(async () => {
    tokenManager = await MSPTokenManager.new();
  });

  it('should create new token and broadcast event', async () => {
    const result = await tokenManager.createTokenContract('', '');
    const newTokenAddress = await tokenManager.mspTokenContracts(accounts[0]);
    expect(newTokenAddress.length).to.equal(42);
    expect(result.logs[0].event).to.equal('MSPTokenCreated');
    expect(result.logs[0].args.contractAddress).to.equal(newTokenAddress);
  });

  it('should return a valid MSP token contract', async () => {
    const result = await tokenManager.createTokenContract('Token', 'TOK');
    const newTokenAddress = await tokenManager.mspTokenContracts(accounts[0]);
    const tokenContract = await MSPToken.at(newTokenAddress);
    expect(await tokenContract.name.call()).to.equal('Token');
    expect(await tokenContract.symbol.call()).to.equal('TOK');
  });

});
