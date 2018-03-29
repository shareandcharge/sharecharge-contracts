const MSPTokenManager = artifacts.require("./MSPTokenManager.sol");

module.exports = function(deployer) {
    deployer.deploy(MSPTokenManager);
}