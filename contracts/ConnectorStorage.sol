pragma solidity ^0.4.21;

import "./Restricted.sol";

contract ConnectorStorage is Restricted {

    event ConnectorCreated(bytes32 indexed connectorId);
    event ConnectorUpdated(bytes32 indexed connectorId);

    struct Connector {
        address owner;
        bytes32 evseId;     // evse this connector belongs to
        uint8 standard;     // connector type (CHADEMO, T1, T2, etc)
        uint8 powerType;
        uint32 voltage;
        uint32 amperage;
    }

    mapping(bytes32 => bytes32[]) public evseToConnectors;
    mapping(bytes32 => Connector) public connectors;

    function create(bytes32 id, bytes32 evseId, uint8 standard, uint8 powerType, uint32 voltage, uint32 amperage)
    external {
        require(connectors[id].owner == address(0));
        connectors[id] = Connector(msg.sender, evseId, standard, powerType, voltage, amperage);
        evseToConnectors[evseId].push(id);
        emit ConnectorCreated(id);
    }

    function update(bytes32 id, bytes32 evseId, uint8 standard, uint8 powerType, uint32 voltage, uint32 amperage)
    external onlyOwner(connectors[id].owner) {
        Connector storage connector = connectors[id];
        connector.evseId = evseId;
        connector.standard = standard;
        connector.powerType = powerType;
        connector.voltage = voltage;
        connector.amperage = amperage;
        emit ConnectorUpdated(id);
    }

    function getById(bytes32 _id) public view returns(bytes32 id, address owner, bytes32 evseId, uint8 standard, uint8 powerType, uint32 voltage, uint32 amperage) {
        Connector storage connector = connectors[_id];
        return (_id, connector.owner, connector.evseId, connector.standard,
        connector.powerType, connector.voltage, connector.amperage);
    }

    function getIdsByEvse(bytes32 evseId) external view returns(bytes32[]) {
        return evseToConnectors[evseId];
    }

}