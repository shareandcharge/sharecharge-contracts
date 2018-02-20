pragma solidity ^0.4.18;

import "./StationStorage.sol";
import "./EVCoin.sol";

contract ChargingStation {

    EVCoin private bank;
    StationStorage private store;

    event RegisteredConnector(bytes32 indexed id);

    event StartRequested(bytes32 indexed clientId, bytes32 indexed connectorId, address controller);
    event StartConfirmed(bytes32 indexed connectorId);

    event StopRequested(bytes32 clientId, bytes32 indexed connectorId, address controller);
    event StopConfirmed(bytes32 indexed connectorId);

    event Error(bytes32 indexed connectorId, uint8 errorCode);

    modifier stationOwnerOnly(bytes32 id) {
        require(store.getOwner(id) == msg.sender);
        _;
    } 

    function ChargingStation(address storageAddress, address coinAddress) public {
        store = StationStorage(storageAddress);
        bank = EVCoin(coinAddress);
    }

    function getAddr() view public returns (address) {
        return address(store);
    }

    function registerConnector(bytes32 id, bytes32 client, string ownerName, string lat, string lng, uint16 price, uint8 priceModel, uint8 plugType, string openingHours, bool isAvailable) public { 
        store.register(id, client, msg.sender, ownerName, lat, lng, price, priceModel, plugType, openingHours, isAvailable);
        RegisteredConnector(id);
    }

    function requestStart(bytes32 connectorId) public {
        require(store.isAvailable(connectorId) == true);
        store.setSession(connectorId, msg.sender);
        bank.restrictedApproval(msg.sender, address(this), 1);
        bank.transferFrom(msg.sender, address(this), 1);
        bytes32 clientId = store.getClient(connectorId);
        StartRequested(clientId, connectorId, msg.sender);
    }

    function confirmStart(bytes32 connectorId, address controller) public stationOwnerOnly(connectorId) {
        require(store.getSession(connectorId) == controller);
        store.setAvailability(connectorId, false);
        StartConfirmed(connectorId);
    }

    function requestStop(bytes32 connectorId) public {
        require(store.getSession(connectorId) == msg.sender);
        bytes32 clientId = store.getClient(connectorId);
        StopRequested(clientId, connectorId, msg.sender);

    }

    function confirmStop(bytes32 connectorId) public stationOwnerOnly(connectorId) {
        store.setSession(connectorId, 0);
        store.setAvailability(connectorId, true);
        bank.transfer(msg.sender, 1);
        StopConfirmed(connectorId);
    }

    function isAvailable(bytes32 connectorId) view public returns(bool) {
        return store.isAvailable(connectorId);
    }

    function setAvailability(bytes32 clientId, bytes32 connectorId, bool _isAvailable) public {
        require(store.getClient(connectorId) == clientId);
        store.setAvailability(connectorId, _isAvailable);
    }

    function logError(bytes32 connectorId, uint8 errorCode) public stationOwnerOnly(connectorId) {
        if (errorCode == 0) {
            bank.transfer(store.getSession(connectorId), 1);
        }      
        Error(connectorId, errorCode);
    }

}
