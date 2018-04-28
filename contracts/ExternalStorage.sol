pragma solidity ^0.4.23;

contract ExternalStorage {

    address private owner;

    struct ChargePointOperator {
        mapping(bytes32 => bytes32) locations;
        bytes32[] globalIDs;
    }

    mapping(address => ChargePointOperator) private CPOs;
    mapping(bytes32 => address) private ownerOf;

    event LocationAdded(bytes32 globalID);
    event LocationUpdated(bytes32 globalID);

    constructor() public {
        owner = msg.sender;
    }

    function addLocation(bytes32 globalID, bytes32 externalHash) public {
        require(CPOs[msg.sender].locations[globalID] == bytes32(0));
        CPOs[msg.sender].locations[globalID] = externalHash;
        CPOs[msg.sender].globalIDs.push(globalID);
        ownerOf[globalID] = msg.sender;
        emit LocationAdded(globalID);
    }

    function updateLocation(bytes32 globalID, bytes32 newHash) public {
        require(CPOs[msg.sender].locations[globalID] != bytes32(0));
        CPOs[msg.sender].locations[globalID] = newHash;
        emit LocationUpdated(globalID);
    }

    function getLocationById(address cpo, bytes32 globalID) view public returns (bytes32) {
        return CPOs[cpo].locations[globalID];
    }

    function getGlobalIDsByCPO(address cpo) view public returns (bytes32[]) {
        return CPOs[cpo].globalIDs;
    }

}