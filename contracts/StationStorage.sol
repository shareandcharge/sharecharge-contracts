pragma solidity ^0.4.18;

contract StationStorage {

    struct Station {
        address owner;
        int32 latitude;
        int32 longitude;
        bytes32 openingHours;
    }

    mapping(bytes32 => Station) public stations;
    bytes32[] public ids;

    function addStation(bytes32 id, address owner, int32 latitude, int32 longitude, bytes32 openingHours) external {
        stations[id] = Station(owner, latitude, longitude, openingHours);
        ids.push(id);
    } 

    function getStation(bytes32 _id) external view returns(bytes32 id, address owner, int32 latitude, int32 longitude, bytes32 openingHours) {
        Station storage station = stations[_id];
        return (_id, station.owner, station.latitude, station.longitude, station.openingHours);
    }

    function getNumberOfStations() external view returns(uint) {
        return ids.length;
    }

    function getIdByIndex(uint index) external view returns(bytes32) {
         return ids[index];
    }

    function setOwner(bytes32 id, address newOwner) external {
        stations[id].owner = newOwner;
    }

    function setLatitude(bytes32 id, int32 latitude) external {
        stations[id].latitude = latitude;
    }

    function setLongitude(bytes32 id, int32 longitude) external {
        stations[id].longitude = longitude;
    }

    function setOpeningHours(bytes32 id, bytes32 openingHours) external {
        stations[id].openingHours = openingHours;
    }

    // // SETTERS
    // function register(bytes32 id, bytes32 client, address owner, bytes32 ownerName, bytes32 lat, bytes32 lng, uint16 price, uint8 priceModel, uint8 plugType, bytes32 openingHours, bool isAvailable) public restricted {
    //     connectors[id] = Connector(client, owner, ownerName, lat, lng, price, priceModel, plugType, openingHours, isAvailable, 0);
    //     ids.push(id);
    // }

    // function setAvailability(bytes32 id, bool isAvailable) public restricted {
    //     connectors[id].isAvailable = isAvailable;
    // }

    // function setSession(bytes32 id, address session) public restricted {
    //     connectors[id].session = session;
    // }

    // // GETTERS
    // function updateRequired(bytes32 id, bytes32 client, address owner, bytes32 ownerName, bytes32 lat, bytes32 lng, uint16 price, uint8 priceModel, uint8 plugType, bytes32 openingHours, bool isAvailable) public view restricted returns (bool) {
    //     Connector memory c = connectors[id];

    //     return c.client != client || c.owner != owner || keccak256(c.ownerName) != keccak256(ownerName) ||
    //     keccak256(c.lat) != keccak256(lat) || keccak256(c.lng) != keccak256(lng) || c.price != price ||
    //     c.priceModel != priceModel || c.plugType != plugType || keccak256(c.openingHours) != keccak256(openingHours) ||
    //     c.isAvailable != isAvailable;
    // }

    // function numberOfConnectors() public view returns (uint256) {
    //     return ids.length;
    // }

    // function idByIndex(uint256 index) public view returns (bytes32) {
    //     return ids[index];
    // }

    // function isAvailable(bytes32 id) public view returns (bool) {
    //     return connectors[id].isAvailable;
    // }

    // function getOwner(bytes32 id) public view returns (address) {
    //     return connectors[id].owner;
    // }

    // function getClient(bytes32 id) public view returns (bytes32) {
    //     return connectors[id].client;
    // }

    // function getSession(bytes32 id) public view returns (address) {
    //     return connectors[id].session;
    // }

}
