pragma solidity ^0.4.18;


import "./StationStorage.sol";
import "./EVCoin.sol";


contract ChargingStation {

    EVCoin private bank;
    StationStorage private store;

    event StartRequested(bytes32 clientId, bytes32 connectorId, address controller, uint256 secondsToRent);
    event StartConfirmed(bytes32 connectorId);

    event StopRequested(bytes32 clientId, bytes32 connectorId, address controller);
    event StopConfirmed(bytes32 connectorId);

    event Error(bytes32 connectorId, uint8 errorCode);

    modifier stationOwnerOnly(bytes32 id) {
        require(store.getOwner(id) == msg.sender);
        _;
    }

    function bytes32ToString(bytes32 source) private pure returns (string result) {

        bytes memory bytesArray = new bytes(32);

        for (uint256 i; i < 32; i++) {
            bytesArray[i] = source[i];
        }

        return string(bytesArray);
    }

    function stringToBytes32(string source) private pure returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }

    function ChargingStation(address storageAddress, address coinAddress) public {
        store = StationStorage(storageAddress);
        bank = EVCoin(coinAddress);
    }

    function getAddr() public view returns (address) {
        return address(store);
    }

    function getOwnerInformation(bytes32 id) public view returns (bytes32 client, address owner, string ownerName) {

        var (_client, _owner, _ownerName,,,,,,,) = store.connectors(id);

        return (_client, _owner, bytes32ToString(_ownerName));
    }

    function getLocationInformation(bytes32 id) public view returns (string lat, string lng) {

        var (,,, _lat, _lng,,,,,,) = store.connectors(id);

        return (bytes32ToString(_lat), bytes32ToString(_lng));
    }

    function getGeneralInformation(bytes32 id) public view returns (uint16 price, uint8 priceModel, uint8 plugType, string openingHours, bool isAvailable, address session) {

        var (,,,,, _price, _priceModel, _plugType, _openingHours, _isAvailable, _session) = store.connectors(id);

        return (_price, _priceModel, _plugType, bytes32ToString(_openingHours), _isAvailable, _session);
    }

    function updateRequired(bytes32 id, bytes32 client, string ownerName, string lat, string lng, uint16 price, uint8 priceModel, uint8 plugType, string openingHours, bool isAvailable) public view returns (bool) {
        return store.updateRequired(id, client, msg.sender, stringToBytes32(ownerName),
            stringToBytes32(lat), stringToBytes32(lng), price, priceModel, plugType,
            stringToBytes32(openingHours), isAvailable);
    }

    function registerConnector(bytes32 id, bytes32 client, string ownerName, string lat, string lng, uint16 price, uint8 priceModel, uint8 plugType, string openingHours, bool isAvailable) public {
        store.register(id, client, msg.sender, stringToBytes32(ownerName),
            stringToBytes32(lat), stringToBytes32(lng), price, priceModel, plugType,
            stringToBytes32(openingHours), isAvailable);
    }

    function requestStart(bytes32 connectorId, uint256 secondsToRent) public {
        require(store.isAvailable(connectorId) == true);
        store.setSession(connectorId, msg.sender);
        bank.restrictedApproval(msg.sender, address(this), 1);
        bank.transferFrom(msg.sender, address(this), 1);
        bytes32 clientId = store.getClient(connectorId);
        StartRequested(clientId, connectorId, msg.sender, secondsToRent);
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

    function isAvailable(bytes32 connectorId) public view returns (bool) {
        return store.isAvailable(connectorId);
    }

    function setAvailability(bytes32 clientId, bytes32 connectorId, bool _isAvailable) public {
        require(store.getClient(connectorId) == clientId);
        store.setAvailability(connectorId, _isAvailable);
    }

    function logError(bytes32 connectorId, uint8 errorCode) public stationOwnerOnly(connectorId) {
        if (errorCode == 0) {
            bank.transfer(store.getSession(connectorId), 1);
            store.setSession(connectorId, 0);
        }      
        Error(connectorId, errorCode);
    }

}
