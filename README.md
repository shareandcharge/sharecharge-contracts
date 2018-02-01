# sharecharge-contracts
Share &amp; Charge eMobility contracts

These contracts use Open Zeppelin version 1.6.0. Install, along with truffle using:

```
npm install
```

## Specification

#### ChargingStation

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
| Error           | `bytes32 connectorId`                     | controller        |

*Error Codes*

| Code    | Error                     |
|---------|---------------------------|
| 0       | Start failed on connector |
| 1       | Stop failed on connector  |

#### StationStorage

*Methods*

| Name                | Inputs                                    |
|---------------------|-------------------------------------------|
| registerConnector   | `bytes32 connectorId, bool isAvailable`   |
| verifyConnector     | `bytes32 connectorId`                     |
| setAvailability     | `bytes32 connectorId, bool isAvailable`   |

## Deployment and Example Usage

An Ethereum client should be running, listening on HTTP (allowing Truffle to establish a connection) and WebSockets (the preferred way of subscribing to events). It should also be configured such that `pubsub` is accessible as a JSONRPC API.

The beta version of web3 (currently provided by default by NPM) is preferred.

*Deployment*
```
truffle migrate
```
**NOTE:** Truffle may not update ABIs in the event of a new migration. If issues occur, try deleting the `build` directory and retrying.

*Usage: Subscribing to all ChargingStation contract events*
```js
const Web3 = require('web3');     
const web3 = new Web3('ws://localhost:8546');

const abi = require('./build/contracts/ChargingStation.json').abi;

const chargingStation = new web3.eth.Contract(abi, address);
chargingStation.events.allEvents({}, console.log);
```
