pragma solidity ^0.4.19;

contract StationStorage {

    event StationCreated(bytes32 indexed stationId);
    event StationUpdated(bytes32 indexed stationId);

    struct Station {
        address owner;
        int32 latitude;
        int32 longitude;
        bytes32 openingHours;
        bool available;
    }

    mapping(bytes32 => Station) public stations;
    bytes32[] public ids;

    function addStation(bytes32 id, address owner, int32 latitude, int32 longitude, bytes32 openingHours, bool available) external {
        stations[id] = Station(owner, latitude, longitude, openingHours, available);
        ids.push(id);
        StationCreated(id);
    }

    function getStation(bytes32 _id) external view returns(bytes32 id, address owner, int32 latitude, int32 longitude, bytes32 openingHours, bool available) {
        Station storage station = stations[_id];
        return (_id, station.owner, station.latitude, station.longitude, station.openingHours, station.available);
    }

    function getNumberOfStations() external view returns(uint) {
        return ids.length;
    }

    function getIdByIndex(uint index) external view returns(bytes32) {
        return ids[index];
    }

    function getIndexById(bytes32 id) external view returns(int) {
        uint length = ids.length;
        for (uint i = 0; i < length; i++) {
            if (ids[i] == id) {
                return int(i);
            }
        }
        return -1;
    }

    function setOwner(bytes32 id, address newOwner) external {
        stations[id].owner = newOwner;
        StationUpdated(id);
    }

    function setLatitude(bytes32 id, int32 latitude) external {
        stations[id].latitude = latitude;
        StationUpdated(id);
    }

    function setLongitude(bytes32 id, int32 longitude) external {
        stations[id].longitude = longitude;
        StationUpdated(id);
    }

    function setOpeningHours(bytes32 id, bytes32 openingHours) external {
        stations[id].openingHours = openingHours;
        StationUpdated(id);
    }

    function setAvailable(bytes32 id, bool available) external {
        stations[id].available = available;
        StationUpdated(id);
    }

}
