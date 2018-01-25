pragma solidity ^0.4.18;

contract ChargingStation {

  event StartRequested(bytes32 indexed connectorId, address user);

  function requestStart(bytes32 connectorId, address user) public {
    StartRequested(connectorId, user);
  }
}
