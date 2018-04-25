pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./EvseStorage.sol";
import "./MSPToken.sol";


contract Charging is Ownable {

    EvseStorage evses;
    MSPToken token;

    event StartRequested(bytes32 evseId, address controller);
    event StartConfirmed(bytes32 evseId, address controller);

    event StopRequested(bytes32 evseId, address controller);
    event StopConfirmed(bytes32 evseId, address controller);

    event ChargeDetailRecord(
        // bytes32 id,              // id of cdr is hash of connectorId, startTime
        uint startTime,             // confirmStop parameter
        uint stopTime,              // confirmStop parameter
        bytes32 evseId,             // confirmStop paremeter
        address controller,         // confirmStop parameter
        bytes3 currency,            // on evse
        uint price,                 // calculated at on confirmStop
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

    function requestStart(bytes32 evseId, uint estimatedPrice) external {
        bool isAvailable;
        (,,isAvailable) = evses.getGeneralInformationById(evseId);
        require(isAvailable == true);
        evses.setController(evseId, msg.sender);

        evses.setSessionPrice(evseId, estimatedPrice);                
        token.restrictedApproval(msg.sender, address(this), estimatedPrice);

        emit StartRequested(evseId, msg.sender);
    }

    function confirmStart(bytes32 evseId) external onlyEvseOwner(evseId) {
        address controller;
        uint price;
        (controller,price) = evses.getSessionById(evseId);

        evses.setAvailable(evseId, false);
        
        token.transferFrom(controller, address(this), price);
        emit StartConfirmed(evseId, controller);
    }

    function requestStop(bytes32 evseId) external {
        address _controller;
        (_controller,) = evses.getSessionById(evseId);
        require(_controller == msg.sender);
        emit StopRequested(evseId, msg.sender);
    }

    function confirmStop(bytes32 evseId, uint startTime, uint stopTime, uint totalEnergy) external onlyEvseOwner(evseId) {
        address controller;
        uint sessionPrice;
        (controller,sessionPrice) = evses.getSessionById(evseId);
        
        evses.setController(evseId, 0);
        evses.setAvailable(evseId, true);
        
        // final price calculation
        uint price = calculatePrice(evseId, controller, stopTime - startTime, totalEnergy);
        token.transfer(msg.sender, price);
        
        uint difference = sessionPrice - price;
        if (difference > 0) {
            token.transfer(controller, difference);
        }

        emit StopConfirmed(evseId, controller);
        
        bytes3 currency;
        (currency,,) = evses.getPriceModelById(evseId);
        emit ChargeDetailRecord(startTime, stopTime, evseId, controller, currency, price, totalEnergy);
    }

    function logError(bytes32 evseId, uint8 errorCode) external onlyEvseOwner(evseId) {
        address controller;
        (controller,) = evses.getSessionById(evseId);
        if (errorCode == 0) {
            // address _controller = evses.getSessionById(evseId);
            // require(controller == _controller);
            // token.transfer(_controller, 1);
            evses.setController(evseId, 0);
        }
        emit Error(evseId, controller, errorCode);
    }

}
