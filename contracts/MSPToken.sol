pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";

contract MSPToken is MintableToken, StandardBurnableToken {

    string public name;
    string public symbol;
    // uint8 public constant decimals = 18;

    address public chargingContract;

    modifier restricted() {
        require(msg.sender == owner || msg.sender == chargingContract, "Unauthorized to call this function");
        _;
    }

    constructor(string _name, string _symbol) public {
        name = _name;
        symbol = _symbol;
    }

    function setAccess(address _chargingAddress) external {
        chargingContract = _chargingAddress;
    }

    function restrictedApproval(address owner, address spender, uint256 value) public restricted {
        require(balanceOf(owner) >= value, "Owner's balance is not greater than or equal to the value being approved");
        allowed[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

}