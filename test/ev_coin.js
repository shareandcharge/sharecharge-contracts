const EVCoin = artifacts.require('./EVCoin.sol');

contract('EVCoin', function(accounts) {

  let coin, supply;

  beforeEach(async () => {
    supply = 100000;
    coin = await EVCoin.new(supply);
    await coin.setAccess(accounts[2]);
  });
  
  it("Should mint initial supply to owner", async () => {
    const balance = await coin.balanceOf(accounts[0]);
    const coins = await coin.totalSupply();
    assert.equal(balance.toNumber(), supply);
    assert.equal(coins.toNumber(), supply);
  });

  it("Should allow standard approval", async () => {
    await coin.approve(accounts[1], 1);
    const allowance = await coin.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 1);
  });

  it("Should transfer from allowance if spender", async () => {
    await coin.approve(accounts[1], 1);
    await coin.transferFrom(accounts[0], accounts[1], 1, { from: accounts[1] });
    const balance = await coin.balanceOf(accounts[1]);
    assert.equal(balance.toNumber(), 1);
  });

  it("Should allow restricted approval", async () => {
    await coin.restrictedApproval(accounts[0], accounts[1], 2, { from: accounts[2] });
    const allowance = await coin.allowance(accounts[0], accounts[1]); 
    assert.equal(allowance.toNumber(), 2);
  });

});
