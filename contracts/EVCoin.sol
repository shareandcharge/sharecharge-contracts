pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./Restricted.sol";

contract EVCoin is MintableToken, Restricted {

    function EVCoin(uint256 initialSupply) public {
        mint(msg.sender, initialSupply);
    }

    function restrictedApproval(address owner, address spender, uint256 value) public restricted {
        allowed[owner][spender] = value;
        Approval(owner, spender, value);
    }

}