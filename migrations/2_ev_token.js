const EVToken = artifacts.require("./EVToken.sol");

module.exports = function(deployer) {
    deployer.deploy(EVToken);
};
