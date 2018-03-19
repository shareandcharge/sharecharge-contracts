const fs = require('fs');

const StationStorage = artifacts.require("./StationStorage.sol");
const ConnectorStorage = artifacts.require("./ConnectorStorage.sol");
const Charging = artifacts.require("./Charging.sol");


module.exports = async function (deployer) {
    // Use deployer to state migration tasks.
    await deployer.deploy(StationStorage);
    await deployer.deploy(ConnectorStorage);
    await deployer.deploy(Charging, ConnectorStorage.address);

    let config = {};
    const contracts = [Charging, StationStorage, ConnectorStorage];
    contracts.forEach(contract => {
        config[contract.contractName] = {
            abi: contract.abi,
            address: contract.address,
            bytecode: contract.bytecode
        };
    });

    const path = process.env['HOME'] + '/.sharecharge/';

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    const outputPath = path + 'config.json';
    await fs.writeFile(outputPath, JSON.stringify(config, null, 2), err => {
        if (err) console.log(err);
    });
};
