const EvseStorage = artifacts.require("./EvseStorage.sol");
const MSPToken = artifacts.require("./MSPToken.sol");
const Charging = artifacts.require("./Charging.sol");

module.exports = async function(deployer) {
    const evses = await EvseStorage.deployed();
    const token = await MSPToken.deployed();
    const charging = await Charging.deployed();
    charging.setEvsesAddress(evses.address);
    charging.setTokenAddress(token.address);
    evses.setAccess(charging.address);
    token.setAccess(charging.address);
};
