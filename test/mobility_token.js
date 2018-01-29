const MobilityToken = artifacts.require('./MobilityToken.sol');

contract('MobilityToken', function(accounts) {

  let token, supply;

  beforeEach(async () => {
    supply = 100000;
    token = await MobilityToken.new(supply);
  });
  
  it.only("Should mint initial supply to owner", async () => {
    const balance = await token.balanceOf(accounts[0]);
    const tokens = await token.totalSupply();
    assert.equal(tokens.toNumber(), supply);
    assert.equal(balance.toNumber(), supply);
  });

});
