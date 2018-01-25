pragma solidity ^0.4.4;

contract Charging {

  uint storedData;

  function setData(uint x) public {
    storedData = x;
  }

  function getData() public view returns (uint) {
    return storedData;
  }

}
