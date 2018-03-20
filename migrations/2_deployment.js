const fs = require('fs');

const StationStorage = artifacts.require("./StationStorage.sol");
const ConnectorStorage = artifacts.require("./ConnectorStorage.sol");
const Charging = artifacts.require("./Charging.sol");

module.exports = async (deployer, network) => {

    const isDevelopment = network === "development";
    const isProduction = network === "production";

    // Use deployer to state migration tasks.
    await deployer.deploy(StationStorage);
    await deployer.deploy(ConnectorStorage);
    await deployer.deploy(Charging, ConnectorStorage.address);

    const connectors = await ConnectorStorage.deployed();
    await connectors.setAccess(Charging.address);

    let config = {};

    const contracts = [Charging, StationStorage, ConnectorStorage];
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
