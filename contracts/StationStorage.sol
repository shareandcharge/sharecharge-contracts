pragma solidity ^0.4.18;

import "./Restricted.sol";

contract StationStorage is Restricted {

    struct Connector {
        bytes32 client;
        address owner;
        bool isAvailable;
        bool isVerified;
    }

    struct CPO {
        string lat;
        string long;
        string termsAndConditions;
    }

    mapping(bytes32 => Connector) public connectors;
    mapping(bytes32 => CPO) public cpos;

    modifier connectorOwnerOnly(bytes32 id) {
        require(msg.sender == connectors[id].owner || msg.sender == Restricted.chargingContract);
        _;
    }

    // SETTERS
    
    // link to the ipfs test text --> QmSR73mBoUKrupCfex3e6DybiMFqdtT2BwPkKAw5KTyEEh
    function registerCPO(bytes32 client, string lat, string long, string termsAndConditions) public onlyOwner {
        cpos[client].lat = lat;
        cpos[client].long = long;
        cpos[client].termsAndConditions = termsAndConditions;
    }

    function registerConnector(bytes32 client, bytes32 id, bool isAvailable) public {
        connectors[id] = Connector(client, msg.sender, isAvailable, false);
    }

    function verifyConnector(bytes32 id) public {
        require(msg.sender == connectors[id].owner);
        connectors[id].isVerified = true;
    }

    function setAvailability(bytes32 id, bool isAvailable) public connectorOwnerOnly(id) {
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

    function getClient(bytes32 id) view public returns (bytes32) {
        return connectors[id].client;
    }

}
