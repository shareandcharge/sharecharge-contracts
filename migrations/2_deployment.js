const fs = require('fs');

const ChargingStation = artifacts.require("./ChargingStation.sol");
const StationStorage = artifacts.require("./StationStorage.sol");
const EVCoin = artifacts.require("./EVCoin.sol");

module.exports = async function (deployer) {

    await deployer.deploy(EVCoin, 10000, {overwrite: false});
    await deployer.deploy(StationStorage, {overwrite: false});
    await deployer.deploy(ChargingStation, StationStorage.address, EVCoin.address, {overwrite: true});

    ChargingStation.deployed()
        .then(cs => {

            EVCoin.deployed()
                .then(ev => {
                    ev.setAccess(cs.address);
                });

            StationStorage.deployed()
                .then(ss => {
                    ss.setAccess(cs.address);
                });

        });

    let config = {};

    const contracts = [ChargingStation, StationStorage, EVCoin];
    contracts.forEach(contract => {
        config[contract.contractName] = {
            abi: contract.abi,
            address: contract.address
        };
    });

    await fs.writeFile('./config.json', JSON.stringify(config, null, 2), err => {
        if (err) console.log(err)
    });

};