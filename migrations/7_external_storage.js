const ExternalStorage = artifacts.require('./ExternalStorage.sol');

module.exports = function(deployer) {
    deployer.deploy(ExternalStorage);
}