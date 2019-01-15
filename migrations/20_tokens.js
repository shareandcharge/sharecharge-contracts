const EurToken = artifacts.require('EurToken');
const UsdToken = artifacts.require('UsdToken');

module.exports = function (deployer) {
    deployer.deploy(EurToken)
      .then(() => deployer.deploy(UsdToken))
};
