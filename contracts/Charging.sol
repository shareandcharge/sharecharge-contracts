pragma solidity ^0.4.19;

import "./EvseStorage.sol";
// import "./EVCoin.sol";

contract Charging {

    EvseStorage evses;

    event StartRequested(bytes32 evseId, address controller, uint256 secondsToRent);
    event StartConfirmed(bytes32 evseId, address controller);

    event StopRequested(bytes32 evseId, address controller);
    event StopConfirmed(bytes32 evseId, address controller);

    event ChargeDetailRecord(
        bytes32 id,                 // id of cdr is hash of connectorId, startTime
        uint startTime,             // confirmStop parameter
        uint stopTime,              // confirmStop parameter
        bytes32 evseId,             // confirmStop paremeter
        address controller,         // confirmStop parameter
        bytes3 currency,            // on evse
        uint tariffId,              // on evse
        uint basePrice,             // on evse
        // uint totalCost           calculated on contract? 
        uint totalEnergy            // confirmStop parameter
    );

    event Error(bytes32 evseId, address controller, uint8 errorCode);

    event Debug(string);

    modifier onlyEvseOwner(bytes32 id) {
        address owner;
        (owner,,,) = evses.getGeneralInformationById(id);
        // address controller = evses.getSessionById(id);
        require(owner == msg.sender);
        /*  || controller == msg.sender */
        _;
    }

    function Charging(address evsesAddress) public {
        evses = EvseStorage(evsesAddress);
    }

    function requestStart(bytes32 evseId, uint256 secondsToRent) external {
        bool isAvailable;
        (,,,isAvailable) = evses.getGeneralInformationById(evseId);
        require(isAvailable == true);
        evses.setController(evseId, msg.sender);
        // bank.restrictedApproval(msg.sender, address(this), 1);
        StartRequested(evseId, msg.sender, secondsToRent);
    }

    function confirmStart(bytes32 evseId, address controller) external onlyEvseOwner(evseId) {
        address _controller = evses.getSessionById(evseId);
        require(_controller == controller);
        evses.setAvailable(evseId, false);
        // bank.transferFrom(msg.sender, address(this), 1);
        StartConfirmed(evseId, controller);
    }

    function requestStop(bytes32 evseId) external {
        address _controller = evses.getSessionById(evseId);
        require(_controller == msg.sender);
        StopRequested(evseId, msg.sender);
    }

    function confirmStop(bytes32 evseId, address controller, uint startTime, uint stopTime, uint totalEnergy) external onlyEvseOwner(evseId) {
        evses.setController(evseId, 0);
        evses.setAvailable(evseId, true);
        // bank.transfer(msg.sender, 1);
        StopConfirmed(evseId, controller);
        bytes32 id = keccak256(evseId, startTime);
        bytes3 currency;
        uint basePrice;
        uint tariffId;
        (currency,basePrice,tariffId) = evses.getPriceModelById(evseId);
        ChargeDetailRecord(id, startTime, stopTime, evseId, controller, currency, tariffId, basePrice, totalEnergy);
    }

    function logError(bytes32 evseId, address controller, uint8 errorCode) external onlyEvseOwner(evseId) {
        if (errorCode == 0) {
            // bank.transfer(store.getSession(evseId), 1);
            evses.setController(evseId, 0);
        }
        Error(evseId, controller, errorCode);
    }

}
