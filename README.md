Share&Charge - Smart Contracts
==============================

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
  [command] help        display usage help for a given command (with optional parameters)

COMMANDS:
  register              register a new charging point connector
  requestStart          ask to start charging at a given charging point connector
  confirmStart          start a charging session at a given charging point connector
  requestStop           ask to stop charging at a given charging point connector
  confirmStop           stop a charging session at a given charging point connector
  state                 display the state of a given charging point connector
  session               display the current charging session of a given charging point connector
  balance               display the EVCoin balance of a given address
  mint                  create new EVCoins for a given address
  accounts              list accounts accessible via RPC
  listen                start listening for all ChargingStation contract events 
                        (requires websocket connection)
  quit                  exit the interactive console
```

For instance, register a charging point connector and send a start request:

```
> register 0x09 0x01
{ transactionHash: '0xa22ae1c906f6a01755f7f80fb06752935c6c310d39f445844322110a74e1e19d',
  blockNumber: 176,
  gasUsed: 27500,
  events: [] }
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

Specification
-------------

### ChargingStation

*Methods*

| Name            | Inputs                                      | Events (outputs)  | Sender          |
|-----------------|---------------------------------------------|-------------------|-----------------|
| requestStart    | `bytes32 connectorId`                       | StartRequested    | controller      |
| requestStop     | `bytes32 connectorId`                       | StopRequested     | controller      |
| confirmStart    | `bytes32 connectorId, address controller`   | StartConfirmed    | connector owner |
| confirmStop     | `bytes32 connectorId`                       | StopConfirmed     | connector owner |
| logError        | `bytes32 connectorId, uint8 errorCode`      | Error             | connector owner |

*Events (outputs)*

| Name            | Indexed parameters                        | Subscriber        |
|-----------------|-------------------------------------------|-------------------|
| StartRequested  | `bytes32 connectorId, address controller` | connector owner   |
| StopRequested   | `bytes32 connectorId, address controller` | connector owner   |
| StartConfirmed  | `bytes32 connectorId`                     | controller        |
| StopConfirmed   | `bytes32 connectorId`                     | controller        |
| Error           | `bytes32 connectorId, uint8 errorCode`    | controller        |

*Error Codes*

| Code    | Error                     |
|---------|---------------------------|
| 0       | Start failed on connector |
| 1       | Stop failed on connector  |

### StationStorage

*Methods*

| Name                | Inputs                                    |
|---------------------|-------------------------------------------|
| registerConnector   | `bytes32 connectorId, bool isAvailable`   |
| verifyConnector     | `bytes32 connectorId`                     |
| setAvailability     | `bytes32 connectorId, bool isAvailable`   |
