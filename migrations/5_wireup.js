const ExternalStorage = artifacts.require("./ExternalStorage.sol");
const MSPToken = artifacts.require("./MSPToken.sol");
const Charging = artifacts.require("./Charging.sol");

module.exports = async function(deployer) {
    const storage = await ExternalStorage.deployed();
    const token = await MSPToken.deployed();
    const charging = await Charging.deployed();
    charging.setStorageAddress(storage.address);
    token.setAccess(charging.address);
    // console.log(`set storage [${storage.address}] in charging [${charging.address}]`);
};
