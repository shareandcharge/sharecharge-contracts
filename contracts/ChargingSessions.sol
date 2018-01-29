pragma solidity ^0.4.18;

import "./Restricted.sol";

contract ChargingSessions is Restricted {

    mapping(bytes32 => address) private sessions;

    function set(bytes32 connectorId, address controller) public restricted {
        sessions[connectorId] = controller;
    }

    function get(bytes32 connectorId) view public restricted returns (address) {
        return sessions[connectorId];
    }

}
