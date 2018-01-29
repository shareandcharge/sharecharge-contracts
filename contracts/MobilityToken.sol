pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract MobilityToken is MintableToken {

    function MobilityToken(uint256 initialSupply) public {
        mint(msg.sender, initialSupply);
    }

}