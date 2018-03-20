pragma solidity ^0.4.19;

import "./ConnectorStorage.sol";
// import "./EVCoin.sol";

contract Charging {

    ConnectorStorage connectors;

    event StartRequested(bytes32 connectorId, address controller, uint256 secondsToRent);
    event StartConfirmed(bytes32 connectorId, address controller);

    event StopRequested(bytes32 connectorId, address controller);
    event StopConfirmed(bytes32 connectorId, address controller);

    event Error(bytes32 connectorId, address controller, uint8 errorCode);

    function Charging(address connectorsAddress) public {
        connectors = ConnectorStorage(connectorsAddress);
    }

    function requestStart(bytes32 connectorId, uint256 secondsToRent) external {
        var (,,,, isAvailable) = connectors.getConnector(connectorId);
        require(isAvailable == true);
        connectors.setController(connectorId, msg.sender);
        // bank.restrictedApproval(msg.sender, address(this), 1);
        // bank.transferFrom(msg.sender, address(this), 1);
        StartRequested(connectorId, msg.sender, secondsToRent);
    }

    function confirmStart(bytes32 connectorId, address controller) external {
        var (,,, _controller,) = connectors.getConnector(connectorId);
        require(_controller == controller);
        connectors.setAvailable(connectorId, false);
        StartConfirmed(connectorId, controller);
    }

    function requestStop(bytes32 connectorId) external {
        var (,,, _controller,) = connectors.getConnector(connectorId);
        require(_controller == msg.sender);
        StopRequested(connectorId, msg.sender);
    }

    function confirmStop(bytes32 connectorId, address controller) external {
        connectors.setController(connectorId, 0);
        connectors.setAvailable(connectorId, true);
        // bank.transfer(msg.sender, 1);
        StopConfirmed(connectorId, controller);
    }

    function logError(bytes32 connectorId, address controller, uint8 errorCode) external {
        if (errorCode == 0) {
            // bank.transfer(store.getSession(connectorId), 1);
            connectors.setController(connectorId, 0);
        }
        Error(connectorId, controller, errorCode);
    }

}
