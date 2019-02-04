pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Settlement is Ownable {
    using SafeMath for uint256;

    // struct Withdrawal {
    //     uint256 amount;
    //     address token;
    //     uint256 timestamp;
    // }

    // token => (holder => balance)
    mapping(address => mapping(address => uint256)) public tokenBalances;
    // signer => (sessionId => withdrawn)
    mapping(address => mapping(string => bool)) private withdrawals;
    // mapping(address => Withdrawal) withdrawals;

    // the owner can transfer arbitrary token amounts. this should only be used in extreme cases
    function transferTokens(address recipient, uint256 amount, address token) public onlyOwner {
        IERC20(token).transfer(recipient, amount);
    }

    // provision an account. the recipient is the address of the future spender
    function transferInto(address recipient, uint256 amount, address token) public {
        //get the tokens
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        //increase the token balance in the payment contract
        tokenBalances[token][recipient] = tokenBalances[token][recipient].add(amount);
    }

    string constant private prefix = "\u0019Ethereum Signed Message:\n32";
    function transfer(address to, string memory sessionId, uint256 amount, address token, uint8 v, bytes32 r, bytes32 s)
    public {
        bytes32 paramHash = keccak256(abi.encodePacked(to, amount, token));
        address signer = ecrecover(keccak256(abi.encodePacked(prefix, paramHash)), v, r, s);
        require(withdrawals[signer][sessionId] == false, "Funds already withdrawn for session with that ID");
        //SafeMath ensures that the signer has enough tokens in their payment account
        tokenBalances[token][signer] = tokenBalances[token][signer].sub(amount);
        withdrawals[signer][sessionId] = true;
        IERC20(token).transfer(to, amount);
    }

}
