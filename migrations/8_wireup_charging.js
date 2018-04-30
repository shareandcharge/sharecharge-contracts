const ExternalStorage = artifacts.require("./EvseStorage.sol");
const MSPToken = artifacts.require("./MSPToken.sol");
const Charging = artifacts.require("./Charging.sol");

module.exports = async function(deployer) {
    const storage = await ExternalStorage.deployed();
    const charging = await Charging.deployed();
    charging.setStorageAddress(storage.address);
};
