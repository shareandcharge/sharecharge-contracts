const MSPToken = artifacts.require("./MSPToken.sol");

module.exports = function(deployer) {
    deployer.deploy(MSPToken, "Share&Charge Token", "SCT");
};
