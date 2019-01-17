module.exports = {
  compilers: {
    solc: {
      version: "0.5.0",
      docker: true,
    }
  },

  networks: {
    development: {
      host: 'localhost',
      port: 8544,
      network_id: '9',
      gas: 4000000
    },
    local: {
      protocol: 'http',
      host: 'localhost',
      port: 8544,
      network_id: '9',
      gas: 4000000
    },
    test: {
      protocol: 'http',
      host: '18.185.68.194',
      port: 8545,
      from: '0x00bd138abd70e2f00903268f3db08f2d25677c9e',
      gasPrice: 49,
      network_id: '*',
      gas: 4700000
    },
    pilot: {
      protocol: 'http',
      host: '18.185.85.20',
      port: 8545,
      from: '0x00bd138abd70e2f00903268f3db08f2d25677c9e',
      gasPrice: 0,
      network_id: '*',
      gas: 4000000
    },
    tobalaba: {
      protocol: 'http',
      host: 'localhost',
      port: 8545,
      gasPrice: 0,
      network_id: '*',
      gas: 4000000
    },
    poa: {
      protocol: 'http',
      host: 'node35590-env-2351721.hidora.com',
      port: 11009,
      network_id: '17',
      from: "0x00a329c0648769a73afac7f9381e08fb43dbea72",
      gas: 4000000
    },
    poalocal: {
      protocol: 'http',
      host: 'localhost',
      port: 8545,
      network_id: '0x11',
      from: "0x00a329c0648769a73afac7f9381e08fb43dbea72",
      gas: 4000000
    },
    production: {
      protocol: 'http',
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 4000000
    }
  }
}


