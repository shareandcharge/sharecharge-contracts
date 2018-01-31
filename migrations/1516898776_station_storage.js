var Migrations = artifacts.require("./StationStorage.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
