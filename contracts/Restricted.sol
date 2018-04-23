pragma solidity ^0.4.23;

contract Restricted {

    address private contractOwner;
    address public chargingContract;

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner);
        _;
    }

    modifier onlyOwner(address owner) {
        require(msg.sender == owner);
        _;
    }

    modifier restricted(address connectorOwner) {
        require(msg.sender == contractOwner || msg.sender == chargingContract || msg.sender == connectorOwner);
        _;
    }

    constructor() public {
        contractOwner = msg.sender;
    }

    function setAccess(address chargingContractAddress) public onlyContractOwner {
        chargingContract = chargingContractAddress;
    }

}