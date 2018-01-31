const ChargingStation = artifacts.require("./ChargingStation.sol");
const StationStorage = artifacts.require("./StationStorage.sol");
const ChargingSessions = artifacts.require("./ChargingSessions.sol");
const EVCoin = artifacts.require("./EVCoin.sol");

module.exports = async function(deployer) {
    const coin = await deployer.deploy(EVCoin, 10000, { overwrite: false });
    const storage = await deployer.deploy(StationStorage, { overwrite: false });
    const session = await deployer.deploy(ChargingSessions, { overwrite: false });
    const charging = await deployer.deploy(ChargingStation, StationStorage.address, ChargingSessions.address, EVCoin.address, { overwrite: true });
}