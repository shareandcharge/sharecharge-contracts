pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ExternalStorage.sol";
import "./MSPToken.sol";


contract Charging is Ownable {

    ExternalStorage private store;

    struct Session {
        string id; // for cpo backend to stop the session
        address controller; // EVdriver wallet address
        uint8 tariffType;  // on tariffs there's an id that we can match to location.
        uint chargeUnits; // unit to be charged on that tariff
        address tokenAddress; // the addr of the contract to pay for the charge
        uint estimatedPrice; // the tokens put for the charge
        uint startTime; // unix time
    }

    //locationId -> evesid (each location can have multiple charging sessions) -> session
    mapping(bytes32 => mapping(bytes32 => Session)) public state;

    event StartRequested(bytes32 scId, bytes32 evseId, bytes32 connectorId, address controller, uint8 tariffType, uint chargeUnits, uint estimatedPrice);
    event StartConfirmed(bytes32 scId, bytes32 evseId, address controller, string sessionId);
    event StopRequested(bytes32 scId, bytes32 evseId, address controller, string sessionId);
    event StopConfirmed(bytes32 scId, bytes32 evseId, address controller);
    event ChargeDetailRecord(bytes32 scId, bytes32 evseId, string sessionId, address controller, uint8 tariffType, 
    uint chargedUnits, uint startTime, uint endTime, address tokenAddress, uint finalPrice);

    event Error(bytes32 scId, bytes32 evseId, address controller, uint8 errorCode);

    modifier onlyLocationOwner(bytes32 id) {
        require(store.getOwnerById(id) == msg.sender, "Only location owner can call this method");
        _;
    }

    // Points to the address to the storage contract
    function setStorageAddress(address storageAddress) public onlyOwner {
        store = ExternalStorage(storageAddress);
    }

    function getStorageAddress() public view returns (address storageAddress) {
        return address(store);
    }

    function requestStart(bytes32 scId, bytes32 evseId, bytes32 connectorId, uint8 tariffType, uint chargeUnits, address tokenAddress, uint estimatedPrice) external {
        require(store.getOwnerById(scId) != address(0), "Location with that Share & Charge ID does not exist");
        state[scId][evseId] = Session("", msg.sender, tariffType, chargeUnits, tokenAddress, estimatedPrice, 0);
        emit StartRequested(scId, evseId, connectorId, msg.sender, tariffType, chargeUnits, estimatedPrice);
        MSPToken token = MSPToken(tokenAddress);
        // user must have tokens even to charge with 0 price
        token.restrictedApproval(msg.sender, address(this), estimatedPrice);
    }

    //only the owner of the location can confirm the start
    //EVSE is the part that controls the power supply to a single EV in a single session. An EVSE may provide
    //multiple connectors but only one of these can be active at the same time.
    function confirmStart(bytes32 scId, bytes32 evseId, string sessionId, uint startTime) external onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        session.id = sessionId;
        session.startTime = startTime;
        MSPToken token = MSPToken(session.tokenAddress);
        token.transferFrom(session.controller, address(this), session.estimatedPrice);
        emit StartConfirmed(scId, evseId, session.controller, sessionId);
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

    function chargeDetailRecord(bytes32 scId, bytes32 evseId, uint chargedUnits, uint finalPrice, uint endTime)
    public onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        uint difference = session.estimatedPrice - finalPrice;
        MSPToken token = MSPToken(session.tokenAddress);
        // account for estimate being too low
        // use burnFrom in StandardBurnableToken to remove remaining approval
        token.transfer(msg.sender, finalPrice);
        if (difference > 0) {
            token.transfer(session.controller, difference);
        }
        emit ChargeDetailRecord(
            scId, evseId, session.id, session.controller, session.tariffType, chargedUnits, session.startTime, endTime, session.tokenAddress, finalPrice
        );
        state[scId][evseId] = Session("", address(0), 0, 0, address(0), 0, 0);
    }

    // ... errorCodes location ?
    function logError(bytes32 scId, bytes32 evseId, uint8 errorCode) external onlyLocationOwner(scId) {
        Session storage session = state[scId][evseId];
        emit Error(scId, evseId, session.controller, errorCode);
    }

}
