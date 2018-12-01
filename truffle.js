module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 4000000
    },
    test: {
      host: '18.185.68.194',
      port: 8545,
      from: '0x00bd138abd70e2f00903268f3db08f2d25677c9e',
      gasPrice: 49,
      network_id: '*',
      gas: 4700000
    },
    pilot: {
      host: '18.185.85.20',
      port: 8545,
      from: '0x00bd138abd70e2f00903268f3db08f2d25677c9e',
      gasPrice: 0,
      network_id: '*',
      gas: 4000000
    },
    tobalaba: {
      host: 'localhost',
      port: 8545,
      gasPrice: 0,
      network_id: '*',
      gas: 4000000
    },
    poa: {
      host: 'node35590-env-2351721.hidora.com',
      port: 11009,
      network_id: '0x11',
      from: "0x00a329c0648769a73afac7f9381e08fb43dbea72",
      gas: 4000000
    },
    poalocal: {
      host: 'localhost',
      port: 8545,
      network_id: '0x11',
      from: "0x00a329c0648769a73afac7f9381e08fb43dbea72",
      gas: 4000000
    },
    production: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 4000000
    }
  }
}
