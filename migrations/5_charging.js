const Charging = artifacts.require("./Charging.sol");
const EVToken = artifacts.require("./EVToken.sol");
const ExternalStorage = artifacts.require("./ExternalStorage.sol");

module.exports = async function(deployer) {
    const evToken = await EVToken.deployed();
    const storage = await ExternalStorage.deployed();
    await deployer.deploy(Charging, storage.address, evToken.address);
};
