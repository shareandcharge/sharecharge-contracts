pragma solidity ^0.4.18;

contract ConnectorStorage {

    event ConnectorCreated(bytes32 indexed connectorId);
    event ConnectorUpdated(bytes32 indexed connectorId);

    event Error(bytes32 connectorId, address controller, uint8 errorCode);

    struct Connector {
        address owner;
        bytes32 stationId;
        uint16 plugMask;
        bool available;
        address controller;
    }

    mapping(bytes32 => bytes32[]) public stationToConnectors;
    mapping(bytes32 => Connector) public connectors;
    bytes32[] public ids;

    function addConnector(bytes32 id, address owner, bytes32 stationId, uint16 plugMask) external {
        connectors[id] = Connector(owner, stationId, plugMask, true, address(0));
        stationToConnectors[stationId].push(id);
        ids.push(id);
    }

    function getConnector(bytes32 _id) public view returns(bytes32 id, address owner, bytes32 stationId, uint16 plugMask, bool available) {
        Connector storage connector = connectors[_id];
        return (_id, connector.owner, connector.stationId, connector.plugMask, connector.available);
    }

    function getNumberOfConnectors() public view returns(uint) {
        return ids.length;
    }

    function getIdByIndex(uint index) public view returns(bytes32) {
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

    function getStationConnectors(bytes32 stationId) public view returns(bytes32[]) {
        return stationToConnectors[stationId];
    }

    function setOwner(bytes32 id, address newOwner) external {
        connectors[id].owner = newOwner;
        ConnectorUpdated(id);
    }

    function setPlugMask(bytes32 id, uint16 plugMask) public {
        connectors[id].plugMask = plugMask;
        ConnectorUpdated(id);
    }

    function setAvailable(bytes32 id, bool available) public {
        connectors[id].available = available;
        ConnectorUpdated(id);
    }

    function setController(bytes32 id, address controller) public {
        connectors[id].controller = controller;
        ConnectorUpdated(id);
    }
}
