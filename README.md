Share&Charge - Smart Contracts
==============================

[![CircleCI](https://circleci.com/gh/motionwerkGmbH/sharecharge-contracts.svg?style=svg&circle-token=4894d650771ab05ec8efbc595c8e77e151784ac9)]

Share&Charge eMobility smart contracts

Quick-start
-----------

Clone and install dependencies:

```
$ git clone https://github.com/motionwerkGmbH/sharecharge-contracts.git
$ cd sharecharge-contracts
$ npm install
```

Ensure you have `ganache-cli` (formerly `ethereumjs-testrpc`) installed and running:

```
$ npm install -g ganache-cli
$ ganache-cli
```

In a different terminal session, ensure the contracts are working as expected:

```
$ npm test
```

Initial deployment of the smart contracts:

```
truffle migrate
```

**NOTE:** Truffle may not update ABIs in the event of a new migration. If issues occur, try deleting the `build` directory and retrying.

Interactive e2e console
-----------------------

This script allows you to interact with the ChargingStation contract from both the perspective of the EV driver (requesting charging sessions) and the Charge Point Operator (confirming charging sessions).

**NOTE**: You need to run `truffle migrate`, otherwise the console will fail to find `config.json` file!

Run the script against your chosen RPC method (`http` for ganache-cli or `ws` for geth with event subscriptions):

```
npm run e2e http
```

Usage:

```
USAGE:
  [command] help        display usage help for a given command [with optional parameters]

COMMANDS:
  register              register new charging point connector(s) using path to json file
  setAvailability       sets the availability of a given charging point to true or false
  requestStart          ask to start charging at a given charging point connector
  confirmStart          start a charging session at a given charging point connector
  requestStop           ask to stop charging at a given charging point connector
  confirmStop           stop a charging session at a given charging point connector
  state                 display the state of a given charging point connector
  session               display the current charging session of a given charging point connector
  balance               display the EVCoin balance of a given address
  mint                  create new EVCoins for a given address
  accounts              list accounts accessible via RPC
  listen                start listening for all ChargingStation contract events (requires websocket connection)
  quit                  exit the interactive console
```

For instance, register two charging point connector (see `./e2e/data/connectors.json` for format):

```
> register
[ { transactionHash: '0xcca0232daf9a2b1c6580fbe3999ff1b02af093e67534bbef5aa4a1ef63a52e36',
    blockNumber: 30,
    gasUsed: 141408,
    events: [ '0', 'RegisteredConnector' ] },
  { transactionHash: '0x9d77b09103ce4a4588886c0ac47ae15af6637b85d61b2492259af396adb41d58',
    blockNumber: 31,
    gasUsed: 141344,
    events: [ '0', 'RegisteredConnector' ] } ]
```

Request information about a connector:
```
> state 0x01
Result {
  client: '0x0900000000000000000000000000000000000000000000000000000000000000',
  owner: '0xb2947F53791Ad33B3419d8177febC2FE57C5De4A',
  ownerName: 'Jim',
  lat: '52.8',
  lng: '-0.6',
  price: '1',
  priceModel: '1',
  plugType: '2',
  openingHours: '0024002400240024002400240024',
  isAvailable: true,
  session: '0x0000000000000000000000000000000000000000' }
```

Request start:
```
> requestStart 0x01
{ transactionHash: '0x4db2c1899150e37d24c06908bc88e518d01518a6f05b170740b7716c073ab5e4',
  blockNumber: 177,
  gasUsed: 76427,
  events: [ '0', 'StartRequested' ] }
```

Subscribing to all ChargingStation contract events
--------------------------------------------------

An Ethereum client (e.g. Geth, Parity) should be running with WebSockets enabled (to subscribe to events). By default Truffle will look for an RPC connection on http://localhost:8545.

A script is provided to setup Geth:

```
npm run geth-dev
```

Example web3 usage:

```js
const Web3 = require('web3');
const web3 = new Web3('ws://localhost:8546');

const abi = require('./build/contracts/ChargingStation.json').abi;

const chargingStation = new web3.eth.Contract(abi, address);
chargingStation.events.allEvents({}, console.log);
```

NPM Link for faster local development
--------------------------------------------------
Run the following command to create a symlink in the global folder for use later with other projects
```
npm link
```
