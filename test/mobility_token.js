const MobilityToken = artifacts.require('./MobilityToken.sol');

contract('MobilityToken', function(accounts) {

  let token, supply;

  beforeEach(async () => {
    supply = 100000;
    token = await MobilityToken.new(supply);
  });
  
  it("Should mint initial supply to owner", async () => {
    const balance = await token.balanceOf(accounts[0]);
    const tokens = await token.totalSupply();
    assert.equal(balance.toNumber(), supply);
    assert.equal(tokens.toNumber(), supply);
  });

  it("Should approve transfer", async () => {
    await token.approve(accounts[1], 1);
    const allowance = await token.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 1);
  });

  it("Should transfer from allowance if spender", async () => {
    await token.approve(accounts[1], 1);
    await token.transferFrom(accounts[0], accounts[1], 1, { from: accounts[1] });
    const balance = await token.balanceOf(accounts[1]);
    assert.equal(balance.toNumber(), 1);
  });

});
