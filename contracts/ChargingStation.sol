pragma solidity ^0.4.18;

import './ChargingStationStorage.sol';

contract ChargingStation {

  ChargingStationStorage private stationStorage;

  event StartRequested(bytes32 indexed connectorId, address controller, string parameters);

  function ChargingStation(address chargingStationStorageAddress) public {
    stationStorage = ChargingStationStorage(chargingStationStorageAddress);
  }

  function requestStart(bytes32 connectorId, address controller, string parameters) public {
    require(stationStorage.isAvailable(connectorId) == true);
    require(stationStorage.isVerified(connectorId) == true);
    StartRequested(connectorId, controller, parameters);
  }

}
