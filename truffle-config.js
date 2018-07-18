module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: "*",
            gas: 4000000
        },
        test: {
            host: 'localhost',
            port: 8545,
            network_id: "*",
            gas: 4000000
        },
        pilot: {
            host: '52.59.207.123',
            port: 8545,
            from: "0x00bd138abd70e2f00903268f3db08f2d25677c9e",
            gasPrice: 0,
            network_id: "*",
            gas: 4000000
        },
        tobalaba: {
            host: '18.184.137.181',
            port: 8545,
            network_id: "*",
            gas: 4000000
        },
        production: {
            host: 'localhost',
            port: 8545,
            network_id: "*",
            gas: 4000000
        }
    }
};
