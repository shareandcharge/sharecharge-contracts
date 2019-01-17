pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Settlement is Ownable {
    using SafeMath for uint256;

    struct Withdrawal {
        uint256 amount;
        address token;
        uint256 timestamp;
    }

    // token => (holder => balance)
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(address => Withdrawal) withdrawals;

    function transferInto(address recipient, uint256 amount, address token) public {
        //get the tokens
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        //increase the token balance in the payment contract
        tokenBalances[token][recipient] = tokenBalances[token][recipient].add(amount);
    }

    string constant private prefix = "\u0019Ethereum Signed Message:\n32";
    function transfer(address to, uint256 amount, address token, uint8 v, bytes32 r, bytes32 s)
    public {
        bytes32 paramHash = keccak256(abi.encodePacked(to, amount, token));
        address signer = ecrecover(keccak256(abi.encodePacked(prefix, paramHash)), v, r, s);
        //SafeMath ensures that the signer has enough tokens in their payment account
        tokenBalances[token][signer] = tokenBalances[token][signer].sub(amount);

        IERC20(token).transfer(to, amount);
    }

}