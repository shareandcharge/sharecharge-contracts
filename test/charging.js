const crypto = require('crypto');

const Charging = artifacts.require("./Charging.sol");

contract('Charging', (accounts) => {

  let charging;

  beforeEach(async () => {
      charging = await Charging.new();
  })

  it('Should log the correct event details when start called', async () => {
    const connector = '0x' + crypto.randomBytes(32).toString('hex');
    const user = accounts[1];

    const result = await charging.start(connector, user);
    
    return new Promise((resolve, reject) => {
      const startEventListener = charging.StartEvent({}, (err, res) => {
        const args = res.args;
        assert.equal(args.connectorId, connector);
        assert.equal(args.user, user);
        startEventListener.stopWatching();      
        resolve();
      });  
    });
  });

});
