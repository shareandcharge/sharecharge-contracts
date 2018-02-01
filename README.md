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
