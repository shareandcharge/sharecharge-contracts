pragma solidity ^0.4.21;

import "./Restricted.sol";

contract EvseStorage is Restricted {

    event EvseCreated(bytes32 indexed evseId);
    event EvseUpdated(bytes32 indexed evseId);

    struct Evse {
        address owner;
        bytes32 uid;
        bytes32 stationId;
        bytes3 currency;
        uint basePrice;
        uint tariffId;        
        bool available;
        address controller;
    }

    mapping(bytes32 => bytes32[]) public stationToEvses;
    mapping(bytes32 => Evse) public evses;
    mapping(bytes32 => bytes32) public evses_uid;
    bytes32[] public ids;

    function create(bytes32 id, bytes32 uid, bytes32 stationId, bytes3 currency, uint basePrice, uint tariffId, bool available) external {
        require(evses[id].owner == address(0));
        evses[id] = Evse(msg.sender, uid, stationId, currency, basePrice, tariffId, available, address(0));
        stationToEvses[stationId].push(id);
        ids.push(id);
        evses_uid[uid] = id;
        emit EvseCreated(id);
    }

    function update(bytes32 id, bytes32 uid, bytes32 stationId,  bytes3 currency, uint basePrice, uint tariffId, bool available) external onlyOwner(evses[id].owner) {
        require(evses[id].owner != address(0));
        Evse storage evse = evses[id];
        evse.uid = uid;
        evse.stationId = stationId;
        evse.available = available;
        evse.currency = currency;
        evse.basePrice = basePrice;
        evse.tariffId = tariffId;
        emit EvseUpdated(id);
    }

    function getById(bytes32 _id) public view returns(bytes32 id, bytes32 uid, address owner, bytes32 stationId, bytes3 currency, uint basePrice, uint tariffId, bool available, address controller) {
        Evse storage evse = evses[_id];
        return (_id, evse.uid, evse.owner, evse.stationId, evse.currency, evse.basePrice, evse.tariffId, evse.available, evse.controller);
    }

    function getByUid(bytes32 _uid) public view returns(bytes32 id, bytes32 uid, address owner, bytes32 stationId, bytes3 currency, uint basePrice, uint tariffId, bool available, address controller) {
        bytes32 evse_id = evses_uid[_uid];
        return getById(evse_id);
    }

    function getGeneralInformationById(bytes32 _id) public view returns(address owner, bytes32 stationid, bool available) {
        Evse storage evse = evses[_id];
        return (evse.owner, evse.stationId, evse.available);
    }

    function getPriceModelById(bytes32 _id) public view returns(bytes3 currency, uint basePrice, uint tariffId) {
        Evse storage evse = evses[_id];
        return (evse.currency, evse.basePrice, evse.tariffId);
    }

    function getSessionById(bytes32 _id) public view returns(address controller) {
        Evse storage evse = evses[_id];
        return evse.controller;
    }

    function getAvailableById(bytes32 _id) public view returns(bool available) {
        Evse storage evse = evses[_id];
        return evse.available;
    }

    function getIdsByStation(bytes32 stationId) external view returns(bytes32[]) {
        return stationToEvses[stationId];
    }

    function getStationAvailability(bytes32 stationId) external view returns(bool){
        bytes32[] storage stationEvses = stationToEvses[stationId];
        for (uint i = 0; i < stationEvses.length; i++) {
            bytes32 id = stationEvses[i];
            if (evses[id].available) {
                return true;
            }
        }
        return false;
    }

    function setOwner(bytes32 id, address newOwner) external onlyOwner(evses[id].owner) {
        evses[id].owner = newOwner;
        emit EvseUpdated(id);
    }

    function setAvailable(bytes32 id, bool available) public restricted(evses[id].owner) {
        evses[id].available = available;
        emit EvseUpdated(id);
    }

    function setController(bytes32 id, address controller) public restricted(evses[id].owner) {
        evses[id].controller = controller;
        emit EvseUpdated(id);
    }

}
