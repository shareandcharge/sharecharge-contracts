const fs = require('fs');

const StationStorage = artifacts.require("./StationStorage.sol");
const EvseStorage = artifacts.require("./EvseStorage.sol");
const ConnectorStorage = artifacts.require("./ConnectorStorage.sol");
const Charging = artifacts.require("./Charging.sol");
const MSPTokenManager = artifacts.require("./MSPTokenManager.sol");

module.exports = async (deployer, network) => {

    const isDevelopment = network === "development";
    const isProduction = network === "production";

    let config = {};

    const contracts = [Charging, StationStorage, ConnectorStorage, EvseStorage, MSPTokenManager];
    contracts.forEach(contract => {

        config[contract.contractName] = {
            abi: contract.abi,
            address: contract.address
        };

        if (!isProduction) {
            config[contract.contractName].bytecode = contract.bytecode;
        }
    });

    const fileName = `contract.defs.${isDevelopment ? "local" : network}.json`;

    if (isDevelopment) {
        const path = process.env['HOME'] + '/.sharecharge/';

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        const outputPath = path + fileName;

        await fs.writeFile(outputPath, JSON.stringify(config, null, 2), err => {
            if (err) console.log(err);
        });
    }

    await fs.writeFile(fileName, JSON.stringify(config, null, 2), err => {
        if (err) console.log(err);
    });
};
