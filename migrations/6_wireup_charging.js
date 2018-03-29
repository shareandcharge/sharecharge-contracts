const EvseStorage = artifacts.require("./EvseStorage.sol");
const Charging = artifacts.require("./Charging.sol");

module.exports = async function(deployer) {
    const evses = await EvseStorage.deployed();
    const charging = await Charging.deployed();
    charging.setEvsesAddress(evses.address);
    evses.setAccess(charging.address);
};
