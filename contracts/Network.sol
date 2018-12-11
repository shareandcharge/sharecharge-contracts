pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Network is Ownable{

    address public token;

    constructor(address _token) public {
        token = _token;
    }
}
