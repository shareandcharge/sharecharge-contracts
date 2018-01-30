pragma solidity ^0.4.18;

import "./ChargingStationStorage.sol";
import "./ChargingSessions.sol";
import "./EVCoin.sol";

contract ChargingStation {

    EVCoin private bank;

    ChargingStationStorage private stationStorage;
    ChargingSessions private chargingSessions;

    event StartRequested(bytes32 indexed connectorId, address controller);
    event StartConfirmed(bytes32 indexed connectorId);

    event StopRequested(bytes32 indexed connectorId, address controller);
    event StopConfirmed(bytes32 indexed connectorId);

    event Error(bytes32 indexed connectorId, uint8 errorCode);

    modifier stationOwnerOnly(bytes32 id) {
        require(stationStorage.getOwner(id) == msg.sender);
        _;
    } 


    function ChargingStation(address stationsAddress, address sessionsAddress, address coinAddress) public {
        stationStorage = ChargingStationStorage(stationsAddress);
        chargingSessions = ChargingSessions(sessionsAddress);
        bank = EVCoin(coinAddress);
    }

    function requestStart(bytes32 connectorId) public {
        require(stationStorage.isAvailable(connectorId) == true);
        require(stationStorage.isVerified(connectorId) == true);
        chargingSessions.set(connectorId, msg.sender);
        StartRequested(connectorId, msg.sender);
    }

    function confirmStart(bytes32 connectorId, address controller) public stationOwnerOnly(connectorId) {
        require(chargingSessions.get(connectorId) == controller);
        stationStorage.setAvailability(connectorId, false);
        bank.transferFrom(controller, address(this), 1);
        StartConfirmed(connectorId);
    }

    function requestStop(bytes32 connectorId) public {
        require(chargingSessions.get(connectorId) == msg.sender);
        StopRequested(connectorId, msg.sender);

    }

    function confirmStop(bytes32 connectorId) public stationOwnerOnly(connectorId) {
        chargingSessions.set(connectorId, 0);
        stationStorage.setAvailability(connectorId, true);
        StopConfirmed(connectorId);
    }

    function logError(bytes32 connectorId, uint8 errorCode) public stationOwnerOnly(connectorId) {        
        Error(connectorId, errorCode);
    }

}
