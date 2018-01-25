pragma solidity ^0.4.18;

import './ChargingStationStorage.sol';

contract ChargingStation {

  ChargingStationStorage chargingStations;

  event StartRequested(bytes32 indexed connectorId, address user);

  function ChargingStation(address chargingStationStorageAddress) public {
    chargingStations = ChargingStationStorage(chargingStationStorageAddress);
  }

  function requestStart(bytes32 connectorId, address user) public {
    require(chargingStations.isAvailable(connectorId) == true);
    StartRequested(connectorId, user);
  }
}
