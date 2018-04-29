const fs = require('fs');
const Web3 = require('web3');
const contract = require("truffle-contract");

const network = process.argv[2] || "development";
const config = require('../truffle-config').networks[network];
const provider = config.provider ? config.provider() : new Web3.providers.HttpProvider(`http://${config.host}:${config.port}`);
const web3 = new Web3(provider);

const contractNames = ['Charging', 'StationStorage', 'ConnectorStorage', 'EvseStorage', 'MSPToken', 'ExternalStorage'];

const isDevelopment = network === "development";
const isProduction = network === "production";

async function publish() {
    const promises = contractNames.map(async contractName => {
        return new Promise((resolve, reject) => {
            const instance = contract(require('../build/contracts/' + contractName));
                instance.setProvider(provider);
                instance.detectNetwork().then(() => {
                    resolve({
                        name: instance.contractName,
                        abi: instance.abi,
                        address: instance.address,
                        bytecode: instance.bytecode
                    });
                });
            });   
    });
    const config = {};
    const result = await Promise.all(promises);
    result.forEach(contract => {
        config[contract.name] = {
            abi: contract.abi,
            address: contract.address
        }
        if (!isProduction || contract.name === 'MSPToken') {
            config[contract.name].bytecode = contract.bytecode;
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
}

publish();




