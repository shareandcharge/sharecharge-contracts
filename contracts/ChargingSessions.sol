pragma solidity ^0.4.18;

contract ChargingSessions {

  address private owner;
  address private chargingContract;

  mapping(bytes32 => address) private sessions;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier restricted() {
    require(msg.sender == owner || msg.sender == chargingContract);
    _;
  }

  function ChargingSessions() public {
    owner = msg.sender;
  }

  function setChargingContractAddress(address chargingContractAddress) public onlyOwner {
    chargingContract = chargingContractAddress;
  }

  function set(bytes32 connectorId, address controller) public restricted {
    sessions[connectorId] = controller;
  }

  function get(bytes32 connectorId) view public restricted returns (address) {
    return sessions[connectorId];
  }

}
