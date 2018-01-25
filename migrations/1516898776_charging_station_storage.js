var Migrations = artifacts.require("./ChargingStationStorage.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
