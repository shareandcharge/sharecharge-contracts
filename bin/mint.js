const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const evc = require('../config.json').EVCoin;
const contract = new web3.eth.Contract(evc.abi, evc.address);

const ETHER = 1;
const EVCOIN = 50;
const RECIPIENT = process.argv[2];

if (!RECIPIENT) {
    console.log('No recipient specified');
    process.exit();
}

const transferEther = async () => {
    const coinbase = await web3.eth.getCoinbase();
    const wei = await web3.utils.toWei(ETHER.toString());
    return web3.eth.sendTransaction({ from: coinbase, to: RECIPIENT, value: wei });
}

const mintCoin = async () => {
    const coinbase = await web3.eth.getCoinbase();
    return contract.methods.mint(RECIPIENT, EVCOIN).send({ from: coinbase });
}


transferEther()
    .then(res => {
        console.log(`Transferred ${ETHER} Ether to address [${res.transactionHash}]`);

        mintCoin()
            .then(res => {

                console.log(`Minted ${EVCOIN} EV Coins for address [${res.transactionHash}]`);
            });
    });

// console.log(`Minting ${EVCOIN} EV Coins for ${RECIPIENT} ...`);