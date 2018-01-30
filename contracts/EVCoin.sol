pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract EVCoin is MintableToken {

    function EVCoin(uint256 initialSupply) public {
        mint(msg.sender, initialSupply);
    }

}