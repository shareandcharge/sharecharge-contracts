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
            const contracts = [this.ChargingSessions, this.StationStorage, this.EVCoin];
            contracts.forEach(contract => contract.methods.setAccess(contractAddress)
                .send({ from: this.coinbase })
            );
        } catch (err) {
            throw Error('Unable to set restricted access on storage contracts');
        }
    } 

    async register(clientId, id, owner) {
        await this.StationStorage.methods.registerConnector(clientId, id, true)
            .send({ from: owner || this.coinbase });
        const tx = await this.StationStorage.methods.verifyConnector(id)
            .send({ from: owner || this.coinbase });
        return helpers.receipt(tx);
    }

    async requestStart(id, driver) {
        const tx = await this.ChargingStation.methods.requestStart(id)
            .send({ from: driver || this.coinbase });
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
        const client = await this.StationStorage.methods.getClient(id).call();
        const owner = await this.StationStorage.methods.getOwner(id).call();
        const isAvailable = await this.StationStorage.methods.isAvailable(id).call();
        const isVerified = await this.StationStorage.methods.isVerified(id).call();
        return { client, owner, isAvailable, isVerified };            
    }

    async session(id) {
        return this.ChargingSessions.methods.get(id).call();
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
    }

    async accounts() {
        return this.web3.eth.getAccounts();
    }
}

module.exports = Contract;