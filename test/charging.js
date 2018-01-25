const crypto = require('crypto');

const Charging = artifacts.require("./Charging.sol");

contract('Charging', (accounts) => {

  let charging;

  beforeEach(async () => {
      charging = await Charging.new();
  })

  it('Should log the correct event details when start called', async () => {
    const connector = '0x' + crypto.randomBytes(32).toString('hex');
    const result = await charging.start(connector);
    const startEventListener = charging.StartEvent({}, (err, res) => {
      assert.equal(res.args.connectorId, connector);
      startEventListener.stopWatching();
    });
  });

});
