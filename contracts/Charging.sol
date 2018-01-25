pragma solidity ^0.4.18;

contract Charging {

  event StartEvent(bytes32 connectorId);

  function start(bytes32 connectorId) public {
    StartEvent(connectorId);
  }


}
