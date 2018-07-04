pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ExternalStorage is Ownable {

    struct ChargePointOperator {

        //Location is a group of one or more EVSEs that belong together geographically or spatially.
        mapping(bytes32 => bytes32) locations;
        bytes32[] scIds;
        bytes32 tariffs;
    }

    mapping(address => ChargePointOperator) private CPOs;
    mapping(bytes32 => address) public ownerOf;

    event LocationAdded(bytes32 scId);
    event LocationUpdated(bytes32 scId);
    event EvseAvailabilityUpdated(bytes32 scId, bytes32 evseId, bool isAvailable);

    function addLocation(bytes32 scId, bytes32 externalHash) public {
        require(CPOs[msg.sender].locations[scId] == bytes32(0), "Location with that Share & Charge ID already exists");
        CPOs[msg.sender].locations[scId] = externalHash;
        CPOs[msg.sender].scIds.push(scId);
        ownerOf[scId] = msg.sender;
        emit LocationAdded(scId);
    }

    function updateLocation(bytes32 scId, bytes32 newHash) public {
        require(CPOs[msg.sender].locations[scId] != bytes32(0), "Location with that Share & Charge ID does not exist");
        CPOs[msg.sender].locations[scId] = newHash;
        emit LocationUpdated(scId);
    }

    function updateEvseAvailability(bytes32 scId, bytes32 evseId, bool isAvailable) public {
        emit EvseAvailabilityUpdated(scId, evseId, isAvailable);
    }

    function addTariffs(bytes32 externalHash) public {
        require(CPOs[msg.sender].tariffs == bytes32(0), "Tariffs already exist for this Charge Point Operator");
        CPOs[msg.sender].tariffs = externalHash;
    }

    function updateTariffs(bytes32 newHash) public {
        require(CPOs[msg.sender].tariffs != bytes32(0), "No tariffs found for this Charge Point Operator");
        CPOs[msg.sender].tariffs = newHash;
    }

    function getLocationById(address cpo, bytes32 scId) view public returns (bytes32) {
        return CPOs[cpo].locations[scId];
    }

    function getOwnerById(bytes32 scId) view public returns (address) {
        return ownerOf[scId];
    }

    function getShareAndChargeIdsByCPO(address cpo) view public returns (bytes32[]) {
        return CPOs[cpo].scIds;
    }

    function getTariffsByCPO(address cpo) view public returns (bytes32) {
        return CPOs[cpo].tariffs;
    }

}