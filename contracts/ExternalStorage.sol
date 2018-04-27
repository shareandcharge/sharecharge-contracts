pragma solidity ^0.4.23;

contract ExternalStorage {

    address private owner;

    struct ChargePointOperator {
        mapping(bytes32 => bytes32) locations;
        bytes32[] globalIDs;
    }

    mapping(address => ChargePointOperator) private CPOs;

    constructor() public {
        owner = msg.sender;
    }

    function addLocation(bytes32 globalID, bytes32 externalHash) public {
        require(CPOs[msg.sender].locations[globalID] == bytes32(0));
        CPOs[msg.sender].locations[globalID] = externalHash;
        CPOs[msg.sender].globalIDs.push(globalID);
    }

    function getLocationById(address cpo, bytes32 globalID) view public returns (bytes32) {
        return CPOs[cpo].locations[globalID];
    }

    function getGlobalIDsByCPO(address cpo) view public returns (bytes32[]) {
        return CPOs[cpo].globalIDs;
    }

}