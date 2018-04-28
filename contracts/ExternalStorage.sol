pragma solidity ^0.4.23;

contract ExternalStorage {

    address private owner;

    struct ChargePointOperator {
        mapping(bytes32 => bytes32) locations;
        bytes32[] globalIds;
        bytes32 tariffs;
    }

    mapping(address => ChargePointOperator) private CPOs;
    // mapping(bytes32 => address) private ownerOf;

    event LocationAdded(bytes32 globalId);
    event LocationUpdated(bytes32 globalId);

    constructor() public {
        owner = msg.sender;
    }

    function addLocation(bytes32 globalId, bytes32 externalHash) public {
        require(CPOs[msg.sender].locations[globalId] == bytes32(0));
        CPOs[msg.sender].locations[globalId] = externalHash;
        CPOs[msg.sender].globalIds.push(globalId);
        // ownerOf[globalID] = msg.sender;
        emit LocationAdded(globalId);
    }

    function updateLocation(bytes32 globalId, bytes32 newHash) public {
        require(CPOs[msg.sender].locations[globalId] != bytes32(0));
        CPOs[msg.sender].locations[globalId] = newHash;
        emit LocationUpdated(globalId);
    }

    function addTariffs(bytes32 externalHash) public {
        require(CPOs[msg.sender].tariffs == bytes32(0));
        CPOs[msg.sender].tariffs = externalHash;
    }

    function updateTariffs(bytes32 newHash) public {
        require(CPOs[msg.sender].tariffs != bytes32(0));
        CPOs[msg.sender].tariffs = newHash;
    }

    function getLocationById(address cpo, bytes32 globalId) view public returns (bytes32) {
        return CPOs[cpo].locations[globalId];
    }

    function getGlobalIdsByCPO(address cpo) view public returns (bytes32[]) {
        return CPOs[cpo].globalIds;
    }

    function getTariffsByCPO(address cpo) view public returns (bytes32) {
        return CPOs[cpo].tariffs;
    }

}