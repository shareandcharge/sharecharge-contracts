pragma solidity ^0.4.19;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";

contract MSPToken is MintableToken, BurnableToken {

    string public name;
    string public symbol;
    // uint8 public constant decimals = 18;

    address private chargingContract;

    modifier restricted() {
        require(msg.sender == owner || msg.sender == chargingContract);
        _;
    }

    function MSPToken(string _name, string _symbol) public {
        name = _name;
        symbol = _symbol;
    }

    function setAccess(address _chargingAddress) external {
        chargingContract = _chargingAddress;
    }

    function restrictedApproval(address owner, address spender, uint256 value) public restricted {
        allowed[owner][spender] = value;
        Approval(owner, spender, value);
    }

}