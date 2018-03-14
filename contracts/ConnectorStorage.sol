pragma solidity ^0.4.18;

contract ConnectorStorage {

    struct Connector {
        bytes32 stationId;
        uint16 plugMask;
        bool isAvailable;
        address controller;
    }

    mapping(bytes32 => bytes32[]) public stationToConnectors;
    mapping(bytes32 => Connector) public connectors;
    bytes32[] public ids;

    function addConnector(bytes32 id, bytes32 stationId, uint16 plugMask) external {
        connectors[id] = Connector(stationId, plugMask, true, address(0));
        stationToConnectors[stationId].push(id);
        ids.push(id);
    } 

    function getConnector(bytes32 id) public view returns(bytes32 stationId, uint16 plugMask, bool isAvailable, address controller) {
        Connector storage connector = connectors[id];
        return (connector.stationId, connector.plugMask, connector.isAvailable, connector.controller);
    }

    function getNumberOfConnectors() public view returns(uint) {
        return ids.length;
    }

    function getIdByIndex(uint index) public view returns(bytes32) {
         return ids[index];
    }

    function getStationConnectors(bytes32 stationId) public view returns(bytes32[]) {
        return stationToConnectors[stationId];
    }

    function setPlugMask(bytes32 id, uint16 plugMask) public {
        connectors[id].plugMask = plugMask;
    }

    function setIsAvailable(bytes32 id, bool isAvailable) public {
        connectors[id].isAvailable = isAvailable;
    } 

    function setController(bytes32 id, address controller) public {
        connectors[id].controller = controller;
    } 
}
