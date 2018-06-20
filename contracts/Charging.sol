pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ExternalStorage.sol";
import "./MSPToken.sol";


contract Charging is Ownable {

    ExternalStorage private store;

    struct Session {
        string id;
        address controller;
        uint8 tariffId;
        uint tariffValue;
        address token;
        uint price;
        uint startTime;
    }

    mapping(bytes32 => mapping(bytes32 => Session)) public state;

    event StartRequested(bytes32 scId, bytes32 evseId, address controller, uint8 tariffId, uint tariffValue);
    event StartConfirmed(bytes32 scId, bytes32 evseId, address controller, string sessionId);
    event StopRequested(bytes32 scId, bytes32 evseId, address controller, string sessionId);
    event StopConfirmed(bytes32 scId, bytes32 evseId, address controller);
    event ChargeDetailRecord(bytes32 scId, bytes32 evseId, address controller, address tokenAddress,
    uint finalPrice, uint8 tariffId, uint finalTariffValue, uint startTime, uint endTime);
    
    event Error(bytes32 scId, bytes32 evseId, address controller, uint8 errorCode);
    event Debug(address param);

    modifier onlyLocationOwner(bytes32 id) {
        require(store.getOwnerById(id) == msg.sender, "Only location owner can call this method");
        _;
    }

    function setStorageAddress(address storageAddress) public onlyOwner {
        store = ExternalStorage(storageAddress);
    }

    function getStorageAddress() view public returns (address storageAddress) {
        return address(store);
    }

    // function getOwner(bytes32 scId) view public onlyOwner returns (address) {
    //     address owner = store.getOwnerById(scId);
    //     return owner;
    // }

    function requestStart(bytes32 scId, bytes32 evseId, uint8 tariffId, uint tariffValue, address tokenAddress, uint estimatedPrice) external {
        require(store.getOwnerById(scId) != address(0), "Location with that Share & Charge ID does not exist");
        state[scId][evseId] = Session("", msg.sender, tariffId, tariffValue, tokenAddress, estimatedPrice, 0);
        emit StartRequested(scId, evseId, msg.sender, tariffId, tariffValue);
        MSPToken token = MSPToken(tokenAddress);
        // user must have tokens even to charge with 0 price
        token.restrictedApproval(msg.sender, address(this), estimatedPrice);
    }

    function confirmStart(bytes32 scId, bytes32 evseId, string sessionId, uint startTime) external onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        session.id = sessionId;
        session.startTime = startTime;
        MSPToken token = MSPToken(session.token);
        token.transferFrom(session.controller, address(this), session.price);
        emit StartConfirmed(scId, evseId, session.controller, sessionId);
    }

    function reset(bytes32 scId, bytes32 evseId) external onlyLocationOwner(scId) {
        delete state[scId][evseId];
    }

    function requestStop(bytes32 scId, bytes32 evseId) external {
        Session storage session = state[scId][evseId];
        require(session.controller == msg.sender, "Given controller did not start the charge session for that EVSE ID");
        emit StopRequested(scId, evseId, msg.sender, session.id);
    }

    function confirmStop(bytes32 scId, bytes32 evseId) public onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        emit StopConfirmed(scId, evseId, session.controller);
    }

    function chargeDetailRecord(bytes32 scId, bytes32 evseId, uint finalPrice, uint tariffValue, uint endTime) 
    public onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        uint difference = session.price - finalPrice;
        MSPToken token = MSPToken(session.token);
        // account for estimate being too low
        // use burnFrom in StandardBurnableToken to remove remaining approval
        token.transfer(msg.sender, finalPrice);
        if (difference > 0) {
            token.transfer(session.controller, difference);
        }
        emit ChargeDetailRecord(
            scId, evseId, session.controller, session.token, finalPrice, session.tariffId, tariffValue, session.startTime, endTime
        );
        state[scId][evseId] = Session("", address(0), 0, 0, address(0), 0, 0);
    }

    function logError(bytes32 scId, bytes32 evseId, uint8 errorCode) external onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        emit Error(scId, evseId, session.controller, errorCode);
    }

}
