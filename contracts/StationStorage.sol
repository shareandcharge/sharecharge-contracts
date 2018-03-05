pragma solidity ^0.4.18;

import "./Restricted.sol";


contract StationStorage is Restricted {

    struct Connector {
        bytes32 client;
        address owner;
        bytes32 ownerName;
        bytes32 lat;
        bytes32 lng;
        uint16 price;
        uint8 priceModel;
        uint8 plugType;
        bytes32 openingHours;
        bool isAvailable;
        address session;
    }

    mapping(bytes32 => Connector) public connectors;
    bytes32[] public ids;

    // SETTERS
    function register(bytes32 id, bytes32 client, address owner, bytes32 ownerName, bytes32 lat, bytes32 lng, uint16 price, uint8 priceModel, uint8 plugType, bytes32 openingHours, bool isAvailable) public restricted {
        connectors[id] = Connector(client, owner, ownerName, lat, lng, price, priceModel, plugType, openingHours, isAvailable, 0);
        ids.push(id);
    }

    function setAvailability(bytes32 id, bool isAvailable) public restricted {
        connectors[id].isAvailable = isAvailable;
    }

    function setSession(bytes32 id, address session) public restricted {
        connectors[id].session = session;
    }

    // GETTERS
    function updateRequired(bytes32 id, bytes32 client, address owner, bytes32 ownerName, bytes32 lat, bytes32 lng, uint16 price, uint8 priceModel, uint8 plugType, bytes32 openingHours, bool isAvailable) public view restricted returns (bool) {
        Connector memory c = connectors[id];

        return c.client != client || c.owner != owner || keccak256(c.ownerName) != keccak256(ownerName) ||
        keccak256(c.lat) != keccak256(lat) || keccak256(c.lng) != keccak256(lng) || c.price != price ||
        c.priceModel != priceModel || c.plugType != plugType || keccak256(c.openingHours) != keccak256(openingHours) ||
        c.isAvailable != isAvailable;
    }

    function numberOfConnectors() public view returns (uint256) {
        return ids.length;
    }

    function idByIndex(uint256 index) public view returns (bytes32) {
        return ids[index];
    }

    function isAvailable(bytes32 id) public view returns (bool) {
        return connectors[id].isAvailable;
    }

    function getOwner(bytes32 id) public view returns (address) {
        return connectors[id].owner;
    }

    function getClient(bytes32 id) public view returns (bytes32) {
        return connectors[id].client;
    }

    function getSession(bytes32 id) public view returns (address) {
        return connectors[id].session;
    }

}
