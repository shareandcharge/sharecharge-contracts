const MSPToken = artifacts.require("./MSPToken.sol");

module.exports = function(deployer) {
    deployer.deploy(MSPToken, "GenericMSPToken", "MSP");
}