const MSPTokenManager = artifacts.require("./MSPTokenManager.sol");

module.exports = async (deployer, network) => {

    // const isDevelopment = network === "development";
    // const isProduction = network === "production";

    // Use deployer to state migration tasks.
    await deployer.deploy(MSPTokenManager);
}