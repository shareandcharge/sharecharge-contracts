pragma solidity ^0.4.19;

import "./Restricted.sol";

contract ConnectorStorage is Restricted {

    event ConnectorCreated(bytes32 indexed id);
    event ConnectorUpdated(bytes32 indexed id);

    struct Connector {
        address owner;
        bytes32 evseId;     // evse this connector belongs to
        uint8 standard;     // connector type (CHADEMO, T1, T2, etc)
        uint8 powerType;
        uint32 voltage;
        uint32 amperage;
        bytes32 tariffId;
    }

    mapping(bytes32 => bytes32[]) public evseToConnectors;
    mapping(bytes32 => Connector) public connectors;

    function insert(bytes32 id, bytes32 evseId, uint8 standard, uint8 powerType, uint32 voltage, uint32 amperage, bytes32 tariffId)
    external {
        connectors[id] = Connector(msg.sender, evseId, standard, powerType, voltage, amperage, tariffId);
        evseToConnectors[evseId].push(id);
        ConnectorCreated(id);
    }

    function update(bytes32 id, bytes32 evseId, uint8 standard, uint8 powerType, uint32 voltage, uint32 amperage, bytes32 tariffId)
    external onlyOwner(connectors[id].owner) {
        Connector storage connector = connectors[id];
        connector.evseId = evseId;
        connector.standard = standard;
        connector.powerType = powerType;
        connector.voltage = voltage;
        connector.amperage = amperage;
        connector.tariffId = tariffId;
        ConnectorUpdated(id);
    }

    function select(bytes32 _id) public view returns(bytes32 id, address owner, bytes32 evseId, uint8 standard, uint8 powerType, uint32 voltage, uint32 amperage, bytes32 tariffId) {
        Connector storage connector = connectors[_id];
        return (_id, connector.owner, connector.evseId, connector.standard,
        connector.powerType, connector.voltage, connector.amperage, connector.tariffId);
    }

    function selectIdsForEvse(bytes32 evseId) external view returns(bytes32[]) {
        return evseToConnectors[evseId];
    }

}