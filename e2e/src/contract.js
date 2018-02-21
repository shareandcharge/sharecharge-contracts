const helpers = require('./contractHelpers');

class Contract {

    constructor (web3, config) {
        this.web3 = web3;
        this.config = config;
        const definitions = Object.keys(config);
        definitions.forEach(def => this[def] = new this.web3.eth.Contract(
            config[def].abi,
            config[def].address
        ));
    }

    async setAccess() {
        try {
            this.coinbase = await this.web3.eth.getCoinbase();
            const contractAddress = this.config.ChargingStation.address;
            const contracts = [this.StationStorage, this.EVCoin];
            contracts.forEach(contract => contract.methods.setAccess(contractAddress)
            .send({ from: this.coinbase })
            );
        } catch (err) {
            throw Error('Unable to set restricted access on storage contracts');
        }
    }

    async register(path, owner) {
        const connectors = path ? require("../data/" + path) : require('../data/connectors.json');
        return Promise.all(Object.keys(connectors).map(async conn => {
            const tx = await this.ChargingStation.methods.registerConnector(...Object.values(connectors[conn]))
            .send({ from: owner || this.coinbase, gas: 300000 });
            return helpers.receipt(tx);
        }));
    }

    async setAvailability(clientId, id, isAvailable) {
        const tx = await this.ChargingStation.methods.setAvailability(clientId, id, isAvailable || false)
        .send({from : this.coinbase});
        return helpers.receipt(tx);
    }

    async requestStart(id, driver) {
        const tx = await this.ChargingStation.methods.requestStart(id)
            .send({ from: driver || this.coinbase, gas: 100000 });
        return helpers.receipt(tx);
    }

    async confirmStart(id, driver, owner) {
        const tx = await this.ChargingStation.methods.confirmStart(id, driver || this.coinbase)
            .send({ from: owner || this.coinbase });
        return helpers.receipt(tx);
    }

    async requestStop(id, driver) {
        const tx = await this.ChargingStation.methods.requestStop(id)
            .send({ from: driver || this.coinbase });
        return helpers.receipt(tx);
    }

    async confirmStop(id, owner) {
        const tx = await this.ChargingStation.methods.confirmStop(id)
            .send({ from: owner || this.coinbase });
        return helpers.receipt(tx);
    }

    async logError(id, errorCode, owner) {
        const tx = await this.ChargingStation.methods.logError(id, errorCode)
            .send({ from: owner || this.coinbase});
        return helpers.receipt(tx);
    }

    async state(id) {
        const result = await this.StationStorage.methods.connectors(id).call();
        return helpers.state(result);
    }

    async balance(address) {
        return this.EVCoin.methods.balanceOf(address).call();
    }

    async mint(address, amount) {
        const tx = await this.EVCoin.methods.mint(address, amount)
            .send({ from: this.coinbase });
        return helpers.receipt(tx);
    }

    async listen() {
        this.ChargingStation.events.allEvents({}, (err, res) => {
            if (err) {
                throw Error(err.message);
            } else {
                console.log(res);
            }
        });

        return 'Listening for events...'
    }

    async accounts() {
        return this.web3.eth.getAccounts();
    }
}

module.exports = Contract;