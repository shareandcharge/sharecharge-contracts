pragma solidity ^0.5.0;

contract CheckSignature {
    string private constant prefix = "\u0019Ethereum Signed Message:\n32";

    function getSigner(bytes32 paramHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address signer) {
        bytes32 hash = keccak256(abi.encodePacked(prefix, paramHash));
        signer = ecrecover(hash, v, r, s);
    }

    function getHashToSign(address to, uint256 amount, address token) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(prefix, keccak256(abi.encodePacked(to, amount, token))));
    }

    function getHash(address to, uint256 amount, address token) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(to, amount, token));
    }

    function getTransferSigner(address to, uint256 amount, address token, uint8 v, bytes32 r, bytes32 s)
    public pure returns (address) {
        return getSigner(keccak256(abi.encodePacked(to, amount, token)), v, r, s);
    }

}
