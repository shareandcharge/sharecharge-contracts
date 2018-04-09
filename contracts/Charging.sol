pragma solidity ^0.4.21;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./EvseStorage.sol";
import "./MSPToken.sol";


contract Charging is Ownable {

    EvseStorage evses;
    MSPToken token;

    event StartRequested(bytes32 evseId, address controller, uint secondsToRent, uint energyToRent);
    event StartConfirmed(bytes32 evseId, address controller);

    event StopRequested(bytes32 evseId, address controller);
    event StopConfirmed(bytes32 evseId, address controller);

    event ChargeDetailRecord(
        // bytes32 id,                 // id of cdr is hash of connectorId, startTime
        uint startTime,             // confirmStop parameter
        uint stopTime,              // confirmStop parameter
        bytes32 evseId,             // confirmStop paremeter
        address controller,         // confirmStop parameter
        bytes3 currency,            // on evse
        uint tariffId,              // on evse
        uint basePrice,             // on evse
        uint totalEnergy            // confirmStop parameter
    );
    
    event Error(bytes32 evseId, address controller, uint8 errorCode);

    event Debug(uint param);

    modifier onlyEvseOwner(bytes32 id) {
        address owner;
        (owner,,,) = evses.getGeneralInformationById(id);
        // address controller = evses.getSessionById(id);
        require(owner == msg.sender);
        /*  || controller == msg.sender */
        _;
    }

    function calculatePrice(bytes32 evseId, address controller, uint secondsToRent, uint kwhToRent) view public returns (uint) {
        address owner;
        (owner,,) = evses.getGeneralInformationById(evseId);
        // don't charge owner
        if (controller == owner) {
            return 0;
        }

        uint basePrice;     // price/hour or price/kw
        uint tariffId;
        (,basePrice,tariffId) = evses.getPriceModelById(evseId);

        // kWh
        if (tariffId == 0) {
            // price per kwh  * number of kwh  * scaled seconds to allow integer division / seconds in hour
            return (basePrice * kwhToRent) * (uint(secondsToRent * 10) / uint(3600)) / 10;

        // flat rate
        } else if (tariffId == 1) {
            return basePrice;

        // time based
        } else if (tariffId == 3) {
            // price per hour   *  scaled seconds to allow integer division / seconds in hour
            return (basePrice ) * (uint(secondsToRent * 10) / uint(3600)) / 10;
        }
    }

    function setEvsesAddress(address evsesAddress) public onlyOwner() {
        evses = EvseStorage(evsesAddress);
    }

    function setTokenAddress(address tokenAddress) public onlyOwner() {
        token = MSPToken(tokenAddress);
    }

    function requestStart(bytes32 evseId, uint secondsToRent, uint kwhToRent) external {
        bool isAvailable;
        (,,,isAvailable) = evses.getGeneralInformationById(evseId);
        require(isAvailable == true);
        evses.setController(evseId, msg.sender);
        token.restrictedApproval(msg.sender, address(this), 1);
        emit StartRequested(evseId, msg.sender, secondsToRent, kwhToRent);
    }

    function confirmStart(bytes32 evseId, address controller) external onlyEvseOwner(evseId) {
        address _controller = evses.getSessionById(evseId);
        require(_controller == controller);
        evses.setAvailable(evseId, false);
        token.transferFrom(_controller, address(this), 1);
        emit StartConfirmed(evseId, controller);
    }

    function requestStop(bytes32 evseId) external {
        address _controller = evses.getSessionById(evseId);
        require(_controller == msg.sender);
        emit StopRequested(evseId, msg.sender);
    }

    function confirmStop(bytes32 evseId, address controller, uint startTime, uint stopTime, uint totalEnergy) external onlyEvseOwner(evseId) {
        evses.setController(evseId, 0);
        evses.setAvailable(evseId, true);
        token.transfer(msg.sender, 1);
        emit StopConfirmed(evseId, controller);
        // bytes32 id = keccak256(evseId, startTime);
        bytes3 currency;
        uint basePrice;
        uint tariffId;
        (currency,basePrice,tariffId) = evses.getPriceModelById(evseId);
        emit ChargeDetailRecord(startTime, stopTime, evseId, controller, currency, tariffId, basePrice, totalEnergy);
    }

    function logError(bytes32 evseId, address controller, uint8 errorCode) external onlyEvseOwner(evseId) {
        if (errorCode == 0) {
            // address _controller = evses.getSessionById(evseId);
            // require(controller == _controller);
            // token.transfer(_controller, 1);
            evses.setController(evseId, 0);
        }
        emit Error(evseId, controller, errorCode);
    }

}
