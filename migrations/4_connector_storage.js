const ConnectorStorage = artifacts.require("./ConnectorStorage.sol");

module.exports = function(deployer) {
    deployer.deploy(ConnectorStorage);
};
