pragma solidity ^0.4.18;

import "./StationStorage.sol";
import "./ChargingSessions.sol";
import "./EVCoin.sol";

contract ChargingStation {

    EVCoin private bank;

    StationStorage private stationStorage;
    ChargingSessions private chargingSessions;

    event StartRequested(bytes32 indexed clientId, bytes32 indexed connectorId, address controller);
    event StartConfirmed(bytes32 indexed connectorId);

    event StopRequested(bytes32 clientId, bytes32 indexed connectorId, address controller);
    event StopConfirmed(bytes32 indexed connectorId);

    event Error(bytes32 indexed connectorId, uint8 errorCode);

    modifier stationOwnerOnly(bytes32 id) {
        require(stationStorage.getOwner(id) == msg.sender);
        _;
    } 

    function ChargingStation(address storageAddress, address sessionsAddress, address coinAddress) public {
        stationStorage = StationStorage(storageAddress);
        chargingSessions = ChargingSessions(sessionsAddress);
        bank = EVCoin(coinAddress);
    }

    function requestStart(bytes32 connectorId) public {
        require(stationStorage.isAvailable(connectorId) == true);
        require(stationStorage.isVerified(connectorId) == true);
        chargingSessions.set(connectorId, msg.sender);
        bytes32 clientId = stationStorage.getClient(connectorId);
        bank.restrictedApproval(msg.sender, address(this), 1);
        StartRequested(clientId, connectorId, msg.sender);
    }

    function confirmStart(bytes32 connectorId, address controller) public stationOwnerOnly(connectorId) {
        require(chargingSessions.get(connectorId) == controller);
        stationStorage.setAvailability(connectorId, false);
        bank.transferFrom(controller, address(this), 1);
        StartConfirmed(connectorId);
    }

    function requestStop(bytes32 connectorId) public {
        require(chargingSessions.get(connectorId) == msg.sender);
        bytes32 clientId = stationStorage.getClient(connectorId);
        StopRequested(clientId, connectorId, msg.sender);

    }

    function confirmStop(bytes32 connectorId) public stationOwnerOnly(connectorId) {
        chargingSessions.set(connectorId, 0);
        stationStorage.setAvailability(connectorId, true);
        bank.transfer(msg.sender, 1);
        StopConfirmed(connectorId);
    }

    function isAvailable(bytes32 connectorId) view public returns(bool) {
        return stationStorage.isAvailable(connectorId);
    }

    function setAvailability(bytes32 clientId, bytes32 connectorId, bool _isAvailable) public {
        require(stationStorage.getClient(connectorId) == clientId);
        stationStorage.setAvailability(connectorId, _isAvailable);
    }

    function logError(bytes32 connectorId, uint8 errorCode) public stationOwnerOnly(connectorId) {        
        Error(connectorId, errorCode);
    }

}
