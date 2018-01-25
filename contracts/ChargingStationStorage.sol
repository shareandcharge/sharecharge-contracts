pragma solidity ^0.4.18;

contract ChargingStationStorage {

  struct Connector {
    bool isAvailable;
  }

  mapping(bytes32 => Connector) public connectors;  

  function setConnector(bytes32 connectorID, bool isAvailable) public {
    connectors[connectorID] = Connector(isAvailable);
  }
  
  function isAvailable(bytes32 connectorID) view public returns (bool) {
    return connectors[connectorID].isAvailable;
  }


}
