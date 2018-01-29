pragma solidity ^0.4.18;

contract ChargingStationStorage {

    struct Connector {
        address owner;
        bool isAvailable;
        bool isVerified;
    }

    mapping(bytes32 => Connector) public connectors;

    // SETTERS

    function registerConnector(bytes32 id, bool isAvailable) public {
        connectors[id] = Connector(msg.sender, isAvailable, false);
    }

    function verifyConnector(bytes32 id) public {
        require(msg.sender == connectors[id].owner);
        connectors[id].isVerified = true;
    }

    function setAvailability(bytes32 id, bool isAvailable) public {
        connectors[id].isAvailable = isAvailable;
    }

    // GETTERS

    function isAvailable(bytes32 id) view public returns (bool) {
        return connectors[id].isAvailable;
    }

    function isVerified(bytes32 id) view public returns (bool) {
        return connectors[id].isVerified;
    }

    function getOwner(bytes32 id) view public returns (address) {
        return connectors[id].owner;
    }

}
