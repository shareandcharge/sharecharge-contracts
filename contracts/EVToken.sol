pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract EVToken is MintableToken {

    string public name = "EV Token";
    string public symbol = "EVT";

}
