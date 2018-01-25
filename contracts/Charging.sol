pragma solidity ^0.4.18;

contract Charging {

  event StartEvent(bytes32 indexed connectorId, address user);

  function start(bytes32 connectorId, address user) public {
    StartEvent(connectorId, user);
  }
}
