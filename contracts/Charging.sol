pragma solidity ^0.4.19;

import "./EvseStorage.sol";
// import "./EVCoin.sol";

contract Charging {

    EvseStorage evses;

    event StartRequested(bytes32 evseId, address controller, uint256 secondsToRent);
    event StartConfirmed(bytes32 evseId, address controller);

    event StopRequested(bytes32 evseId, address controller);
    event StopConfirmed(bytes32 evseId, address controller);

    event Error(bytes32 evseId, address controller, uint8 errorCode);

    modifier onlyEvseOwner(bytes32 id) {
        var (,owner,,,,) = evses.getById(id);
        require(owner == msg.sender);
        _;
    }

    function Charging(address evsesAddress) public {
        evses = EvseStorage(evsesAddress);
    }

    function requestStart(bytes32 evseId, uint256 secondsToRent) external {
        var (,,,,isAvailable,) = evses.getById(evseId);
        require(isAvailable == true);
        evses.setController(evseId, msg.sender);
        // bank.restrictedApproval(msg.sender, address(this), 1);
        // bank.transferFrom(msg.sender, address(this), 1);
        StartRequested(evseId, msg.sender, secondsToRent);
    }

    function confirmStart(bytes32 evseId, address controller) external onlyEvseOwner(evseId) {
        var (,,,,,_controller) = evses.getById(evseId);
        require(_controller == controller);
        evses.setAvailable(evseId, false);
        StartConfirmed(evseId, controller);
    }

    function requestStop(bytes32 evseId) external {
        var (,,,,,_controller) = evses.getById(evseId);
        require(_controller == msg.sender);
        StopRequested(evseId, msg.sender);
    }

    function confirmStop(bytes32 evseId, address controller) external onlyEvseOwner(evseId) {
        evses.setController(evseId, 0);
        evses.setAvailable(evseId, true);
        // bank.transfer(msg.sender, 1);
        StopConfirmed(evseId, controller);
    }

    function logError(bytes32 evseId, address controller, uint8 errorCode) external onlyEvseOwner(evseId) {
        if (errorCode == 0) {
            // bank.transfer(store.getSession(evseId), 1);
            evses.setController(evseId, 0);
        }
        Error(evseId, controller, errorCode);
    }

}
