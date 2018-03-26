pragma solidity ^0.4.18;

import "./Restricted.sol";

contract EvseStorage is Restricted {

    event EvseCreated(bytes32 indexed evseId);
    event EvseUpdated(bytes32 indexed evseId);

    struct Evse {
        address owner;
        bytes32 stationId;
        uint16 plugMask;
        bool available;
        address controller;
    }

    mapping(bytes32 => bytes32[]) public stationToEvses;
    mapping(bytes32 => Evse) public evses;
    bytes32[] public ids;

    function create(bytes32 id, bytes32 stationId, uint16 plugMask, bool available) external {
        require(evses[id].owner == address(0));
        evses[id] = Evse(msg.sender, stationId, plugMask, available, address(0));
        stationToEvses[stationId].push(id);
        ids.push(id);
        EvseCreated(id);
    }

    function update(bytes32 id, bytes32 stationId, uint16 plugMask, bool available) external onlyOwner(evses[id].owner) {
        require(evses[id].owner != address(0));
        Evse storage evse = evses[id];
        evse.stationId = stationId;
        evse.plugMask = plugMask;
        evse.available = available;
        EvseUpdated(id);
    }

    function getById(bytes32 _id) public view returns(bytes32 id, address owner, bytes32 stationId, uint16 plugMask, bool available, address controller) {
        Evse storage evse = evses[_id];
        return (_id, evse.owner, evse.stationId, evse.plugMask, evse.available, evse.controller);
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
        EvseUpdated(id);
    }

    function setPlugMask(bytes32 id, uint16 plugMask) external onlyOwner(evses[id].owner) {
        evses[id].plugMask = plugMask;
        EvseUpdated(id);
    }

    function setAvailable(bytes32 id, bool available) public restricted(evses[id].owner) {
        evses[id].available = available;
        EvseUpdated(id);
    }

    function setController(bytes32 id, address controller) public restricted(evses[id].owner) {
        evses[id].controller = controller;
        EvseUpdated(id);
    }

}
