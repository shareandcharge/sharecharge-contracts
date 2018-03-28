pragma solidity ^0.4.19;

import "./MSPToken.sol";

contract MSPTokenManager {

    event MSPTokenCreated(address indexed contractAddress);

    mapping(address => address) public mspTokenContracts;

    function createTokenContract(string _name, string _symbol) external {
        mspTokenContracts[msg.sender] = new MSPToken(_name, _symbol);
        MSPTokenCreated(mspTokenContracts[msg.sender]);
    }

}
