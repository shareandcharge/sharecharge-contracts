const Charging = artifacts.require("./Charging.sol");

module.exports = function(deployer) {
    deployer.deploy(Charging);
};
