pragma solidity ^0.4.18;

contract ChargingStationStorage {

  struct Connector {
    bool isAvailable;
    bool isVerified;
  }

  mapping(bytes32 => Connector) public connectors;  

  function setConnector(bytes32 connectorID, bool isAvailable) public {
    connectors[connectorID] = Connector(isAvailable, false);
  }

  function verifyConnector(bytes32 connectorID) public {
    connectors[connectorID].isVerified = true;
  }
  
  function isAvailable(bytes32 connectorID) view public returns (bool) {
    return connectors[connectorID].isAvailable;
  }

  function isVerified(bytes32 connectorID) view public returns (bool) {
    return connectors[connectorID].isVerified;
  }

}
