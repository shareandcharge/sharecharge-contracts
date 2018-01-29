pragma solidity ^0.4.18;

contract Restricted {

    address private owner;
    address public chargingContract;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier restricted() {
        require(msg.sender == owner || msg.sender == chargingContract);
        _;
    }

    function Restricted () public {
        owner = msg.sender;
    }

    function setChargingContractAddress(address chargingContractAddress) public onlyOwner {
        chargingContract = chargingContractAddress;
    }

}