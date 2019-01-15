const Settlement = artifacts.require('Settlement');

module.exports = function (deployer) {
    deployer.deploy(Settlement);
};
