const StationStorage = artifacts.require("./StationStorage.sol");

module.exports = function(deployer) {
    deployer.deploy(StationStorage);
};
