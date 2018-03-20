pragma solidity ^0.4.19;

import "./Restricted.sol";

contract StationStorage is Restricted {

    event StationCreated(bytes32 indexed stationId);
    event StationUpdated(bytes32 indexed stationId);

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
        StationCreated(id);
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

    function getIndexById(bytes32 id) external view returns(int) {
        uint length = ids.length;
        for (uint i = 0; i < length; i++) {
            if (ids[i] == id) {
                return int(i);
            }
        }
        return -1;
    }

    function setOwner(bytes32 id, address newOwner) external onlyOwner(stations[id].owner) {
        stations[id].owner = newOwner;
        StationUpdated(id);
    }

    function setLatitude(bytes32 id, int32 latitude) external onlyOwner(stations[id].owner) {
        stations[id].latitude = latitude;
        StationUpdated(id);
    }

    function setLongitude(bytes32 id, int32 longitude) external onlyOwner(stations[id].owner) {
        stations[id].longitude = longitude;
        StationUpdated(id);
    }

    function setOpeningHours(bytes32 id, bytes32 openingHours) external onlyOwner(stations[id].owner) {
        stations[id].openingHours = openingHours;
        StationUpdated(id);
    }
}
