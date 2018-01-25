var Migrations = artifacts.require("./ChargingStation.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
