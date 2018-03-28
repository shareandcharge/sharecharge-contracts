pragma solidity ^0.4.19;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";

contract MSPToken is MintableToken, BurnableToken {

    string public name;
    string public symbol;
    // uint8 public constant decimals = 18;

    function MSPToken(string _name, string _symbol) public {
        name = _name;
        symbol = _symbol;
    }

}