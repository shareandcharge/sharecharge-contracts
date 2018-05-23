pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ExternalStorage.sol";
import "./MSPToken.sol";

contract Charging is Ownable {

    ExternalStorage store;

    struct Session {
        address controller;
        address token;
        uint price;
    }

    mapping(bytes32 => mapping(bytes32 => Session)) private state;

    event StartRequested(bytes32 scId, bytes32 evseId, address controller);
    event StartConfirmed(bytes32 scId, bytes32 evseId, address controller, bytes32 sessionId);
    event StopRequested(bytes32 scId, bytes32 evseId, address controller);
    event StopConfirmed(bytes32 scId, bytes32 evseId, address controller);
    event ChargeDetailRecord(bytes32 scId, bytes32 evseId, address controller, address tokenAddress, uint finalPrice, uint timestamp);
    event Error(bytes32 scId, bytes32 evseId, address controller, uint8 errorCode);
    event Debug(address param);

    modifier onlyLocationOwner(bytes32 id) {
        require(store.getOwnerById(id) == msg.sender);
        _;
    }

    function setStorageAddress(address storageAddress) public onlyOwner {
        store = ExternalStorage(storageAddress);
    }

    function getSession(bytes32 scId, bytes32 evseId) view public returns (address controller, address token, uint price) {
        Session storage session = state[scId][evseId];
        return (session.controller, session.token, session.price);
    }

    // function getOwner(bytes32 scId) view public onlyOwner returns (address) {
    //     address owner = store.getOwnerById(scId);
    //     return owner;
    // }

    function requestStart(bytes32 scId, bytes32 evseId, address tokenAddress, uint estimatedPrice) external {
        require(store.getOwnerById(scId) != address(0));
        require(state[scId][evseId].controller == address(0));
        state[scId][evseId] = Session(msg.sender, tokenAddress, estimatedPrice);
        emit StartRequested(scId, evseId, msg.sender);
        MSPToken token = MSPToken(tokenAddress);
        // user must have tokens even to charge with 0 price
        token.restrictedApproval(msg.sender, address(this), estimatedPrice);
    }

    function confirmStart(bytes32 scId, bytes32 evseId, bytes32 sessionId) external onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        MSPToken token = MSPToken(session.token);
        token.transferFrom(session.controller, address(this), session.price);
        emit StartConfirmed(scId, evseId, session.controller, sessionId);
    }

    function requestStop(bytes32 scId, bytes32 evseId) external {
        Session storage session = state[scId][evseId];
        require(session.controller == msg.sender);
        emit StopRequested(scId, evseId, msg.sender);
    }

    function confirmStop(bytes32 scId, bytes32 evseId) public onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        emit StopConfirmed(scId, evseId, session.controller);
    } 

    function chargeDetailRecord(bytes32 scId, bytes32 evseId, uint finalPrice, uint timestamp) public onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        uint difference = session.price - finalPrice;
        MSPToken token = MSPToken(session.token);
        // account for estimate being too low
        // use burnFrom in StandardBurnableToken to remove remaining approval
        token.transfer(msg.sender, finalPrice);
        if (difference > 0) {    
            token.transfer(session.controller, difference);
        }
        emit ChargeDetailRecord(scId, evseId, session.controller, session.token, finalPrice, timestamp);
        state[scId][evseId] = Session(address(0), address(0), 0);
    }

    function logError(bytes32 scId, bytes32 evseId, uint8 errorCode) external onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        emit Error(scId, evseId, session.controller, errorCode);
    }

}
