pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./EvseStorage.sol";
import "./MSPToken.sol";

contract ChargingOld is Ownable {

    EvseStorage evses;

    struct Session {
        address controller;
        address token;
        uint price;
    }

    mapping(bytes32 => Session) private state;

    event StartRequested(bytes32 evseId, address controller);
    event StartConfirmed(bytes32 evseId, address controller);

    event StopRequested(bytes32 evseId, address controller);
    event StopConfirmed(bytes32 evseId, address controller);

    event ChargeDetailRecord(bytes32 evseId, address controller, address tokenAddress, uint finalPrice, uint timestamp);
    
    event Error(bytes32 evseId, address controller, uint8 errorCode);

    event Debug(uint param);

    modifier onlyEvseOwner(bytes32 id) {
        address owner;
        (owner,,,) = evses.getGeneralInformationById(id);
        require(owner == msg.sender);
        _;
    }

    function setEvsesAddress(address evsesAddress) public onlyOwner() {
        evses = EvseStorage(evsesAddress);
    }

    function requestStart(bytes32 evseId, address tokenAddress, uint estimatedPrice) external {
        bool isAvailable;
        (,,isAvailable) = evses.getGeneralInformationById(evseId);
        require(isAvailable == true);
        state[evseId] = Session(msg.sender, tokenAddress, estimatedPrice);
        emit StartRequested(evseId, msg.sender);
        MSPToken token = MSPToken(tokenAddress);
        token.restrictedApproval(msg.sender, address(this), estimatedPrice);
    }

    function confirmStart(bytes32 evseId) external onlyEvseOwner(evseId) {
        Session storage session = state[evseId];
        evses.setAvailable(evseId, false);
        MSPToken token = MSPToken(session.token);
        token.transferFrom(session.controller, address(this), session.price);
        emit StartConfirmed(evseId, session.controller);
    }

    function requestStop(bytes32 evseId) external {
        Session storage session = state[evseId];
        require(session.controller == msg.sender);
        emit StopRequested(evseId, msg.sender);
    }

    function confirmStop(bytes32 evseId) public onlyEvseOwner(evseId) {
        Session storage session = state[evseId];
        emit StopConfirmed(evseId, session.controller);
    } 

    function chargeDetailRecord(bytes32 evseId, uint finalPrice, uint timestamp) public onlyEvseOwner(evseId) {
        Session storage session = state[evseId];
        uint difference = session.price - finalPrice;
        MSPToken token = MSPToken(session.token);
        // account for estimate being too low
        // use burnFrom in StandardBurnableToken to remove remaining approval
        token.transfer(msg.sender, finalPrice);
        if (difference > 0) {    
            token.transfer(session.controller, difference);
        }
        emit ChargeDetailRecord(evseId, session.controller, session.token, finalPrice, timestamp);
        evses.setAvailable(evseId, true);
        state[evseId] = Session(address(0), address(0), 0);
    }

    function logError(bytes32 evseId, uint8 errorCode) external onlyEvseOwner(evseId) {
        Session storage session = state[evseId];
        emit Error(evseId, session.controller, errorCode);
    }

}
