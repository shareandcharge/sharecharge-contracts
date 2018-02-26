const readline = require('readline');
const Web3 = require('web3');
const Contract = require('./src/contract');
const help = require('./src/help');
const config = require('../config.json');

let rpc = process.argv[2];

switch (rpc) {
    case 'http':
        rpc = 'http://localhost:8545';
        break;
    case 'ws':
        rpc = 'ws://localhost:8546';
        break;
    default:
        console.log(help.usage);
        process.exit();
}

const web3 = new Web3(rpc);
const contract = new Contract(web3, config);
console.log(`connected to ${web3.currentProvider.host || rpc}`);

const rl = readline.createInterface(process.stdin, process.stdout);
rl.prompt();

rl.on('line', async line => {

    const [cmd, ...params] = line.split(' ');

    switch (cmd) {
        case 'quit':
            rl.close();
            break;
        case 'help':
            console.log(help.index);
            break;
        default:
            try {
                console.log(params[0] === 'help' ? help[cmd] : await contract[cmd](...params));
            } catch (err) {
                console.log(err.message);
            }
    }

    rl.prompt();

}).on('close', process.exit);
