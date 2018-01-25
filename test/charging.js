const Charging = artifacts.require("./Charging.sol");

contract('Charging', (accounts) => {

  let charging;

  beforeEach(async () => {
      charging = await Charging.new();
  })

  it("simple test to verify testing works", async () => {
    charging.setData(42);
    const result = await charging.getData();
    assert.equal(result, 42);
  });
});
