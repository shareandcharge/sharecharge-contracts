pragma solidity ^0.4.19;

import "./ConnectorStorage.sol";
// import "./EVCoin.sol";

contract Charging {

    ConnectorStorage connectors;

    event StartRequested(bytes32 connectorId, address controller, uint256 secondsToRent);
    event StartConfirmed(bytes32 connectorId, address controller);

    event StopRequested(bytes32 connectorId, address controller);
    event StopConfirmed(bytes32 connectorId, address controller);

    event Debug(address a, address b);
    event Debug2(bytes32 a, address b);

    event Error(bytes32 connectorId, address controller, uint8 errorCode);

    modifier onlyConnectorOwner(bytes32 id) {
        var (,owner,,,,) = connectors.getConnector(id);
        require(owner == msg.sender);
        _;
    }

    function Charging(address connectorsAddress) public {
        connectors = ConnectorStorage(connectorsAddress);
    }

    function requestStart(bytes32 connectorId, uint256 secondsToRent) external {
        var (,,,,isAvailable,) = connectors.getConnector(connectorId);
        require(isAvailable == true);
        connectors.setController(connectorId, msg.sender);
        // Debug2(connectorId, msg.sender);
        // bank.restrictedApproval(msg.sender, address(this), 1);
        // bank.transferFrom(msg.sender, address(this), 1);
        StartRequested(connectorId, msg.sender, secondsToRent);
    }

    function confirmStart(bytes32 connectorId, address controller) external onlyConnectorOwner(connectorId) {
        var (,,,,,_controller) = connectors.getConnector(connectorId);
        require(_controller == controller);
        // Debug(_controller, controller);
        // Debug2(connectorId, msg.sender);
        connectors.setAvailable(connectorId, false);
        StartConfirmed(connectorId, controller);
    }

    function requestStop(bytes32 connectorId) external {
        var (,,,,,_controller) = connectors.getConnector(connectorId);        
        require(_controller == msg.sender);
        StopRequested(connectorId, msg.sender);
    }

    function confirmStop(bytes32 connectorId, address controller) external onlyConnectorOwner(connectorId) {
        connectors.setController(connectorId, 0);
        connectors.setAvailable(connectorId, true);
        // bank.transfer(msg.sender, 1);
        StopConfirmed(connectorId, controller);
    }

    function logError(bytes32 connectorId, address controller, uint8 errorCode) external onlyConnectorOwner(connectorId) {
        if (errorCode == 0) {
            // bank.transfer(store.getSession(connectorId), 1);
            connectors.setController(connectorId, 0);
        }
        Error(connectorId, controller, errorCode);
    }

}
