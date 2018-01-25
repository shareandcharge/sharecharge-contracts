var Migrations = artifacts.require("./Charging.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
