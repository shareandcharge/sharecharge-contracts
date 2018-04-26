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
        bytes32 id,
        address controller,
        uint finalPrice
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

    function confirmStop(bytes32 evseId) public onlyEvseOwner(evseId) {
        address controller;
        (controller,) = evses.getSessionById(evseId);
        emit StopConfirmed(evseId, controller);
    } 

    function chargeDetailRecord(bytes32 evseId, uint finalPrice) public onlyEvseOwner(evseId) {
        address _controller;        
        uint sessionPrice;
        (_controller, sessionPrice) = evses.getSessionById(evseId);
        uint difference = sessionPrice - finalPrice;
        token.transfer(msg.sender, finalPrice);
        if(difference > 0) {
            token.transfer(_controller, difference);
        }
        emit ChargeDetailRecord(evseId, _controller, finalPrice);
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
