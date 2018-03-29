const EvseStorage = artifacts.require("./EvseStorage.sol");

module.exports = function(deployer) {
    deployer.deploy(EvseStorage);
};
