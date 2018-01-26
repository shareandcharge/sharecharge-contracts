pragma solidity ^0.4.18;

import './ChargingStationStorage.sol';

contract ChargingStation {

  ChargingStationStorage private stationStorage;

  mapping(bytes32 => address) private sessions;

  event StartRequested(bytes32 indexed connectorId, address controller);
  event StartConfirmed(bytes32 indexed connectorId);

  function ChargingStation(address chargingStationStorageAddress) public {
    stationStorage = ChargingStationStorage(chargingStationStorageAddress);
  }

  function requestStart(bytes32 connectorId) public {
    require(stationStorage.isAvailable(connectorId) == true);
    require(stationStorage.isVerified(connectorId) == true);
    sessions[connectorId] = msg.sender;
    StartRequested(connectorId, msg.sender);
  }

  function confirmStart(bytes32 connectorId, address controller) public {
    require(stationStorage.getOwner(connectorId) == msg.sender);
    require(sessions[connectorId] == controller);
    StartConfirmed(connectorId);
  }

}
