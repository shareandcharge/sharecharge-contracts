pragma solidity ^0.4.23;

import "./Restricted.sol";

contract StationStorage is Restricted {

    event StationCreated(bytes32 indexed stationId);
    event StationUpdated(bytes32 indexed stationId);

    event debug(address owner);

    struct Station {
        address owner;
        int32 latitude;
        int32 longitude;
        bytes32 openingHours;
    }

    mapping(bytes32 => Station) public stations;
    bytes32[] public ids;

    function create(bytes32 id, int32 latitude, int32 longitude, bytes32 openingHours) external {
        require(stations[id].owner == address(0));
        stations[id] = Station(msg.sender, latitude, longitude, openingHours);
        ids.push(id);
        emit StationCreated(id);
    }

    function update(bytes32 id, int32 latitude, int32 longitude, bytes32 openingHours) external onlyOwner(stations[id].owner) {
        Station storage station = stations[id];
        emit debug(station.owner);
        station.latitude = latitude;
        station.longitude = longitude;
        station.openingHours = openingHours;
        emit StationUpdated(id);
    }

    function getById(bytes32 _id) public view returns(bytes32 id, address owner, int32 latitude, int32 longitude, bytes32 openingHours) {
        Station storage station = stations[_id];
        return (_id, station.owner, station.latitude, station.longitude, station.openingHours);
    }

    function getTotal() external view returns(uint) {
        return ids.length;
    }

    function getByIndex(uint index) external view returns(bytes32 id, address owner, int32 latitude, int32 longitude, bytes32 openingHours) {
        bytes32 station = ids[index];
        return getById(station);
    }

    function setOwner(bytes32 id, address newOwner) external onlyOwner(stations[id].owner) {
        stations[id].owner = newOwner;
        emit StationUpdated(id);
    }

    function setLatitude(bytes32 id, int32 latitude) external onlyOwner(stations[id].owner) {
        stations[id].latitude = latitude;
        emit StationUpdated(id);
    }

    function setLongitude(bytes32 id, int32 longitude) external onlyOwner(stations[id].owner) {
        stations[id].longitude = longitude;
        emit StationUpdated(id);
    }

    function setOpeningHours(bytes32 id, bytes32 openingHours) external onlyOwner(stations[id].owner) {
        stations[id].openingHours = openingHours;
        emit StationUpdated(id);
    }
}
