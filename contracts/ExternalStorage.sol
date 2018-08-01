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

    event LocationAdded(address cpo, bytes32 scId);
    event LocationUpdated(address cpo, bytes32 scId);
    event LocationDeleted(address cpo, bytes32 scId);
    event TariffsAdded(address cpo);
    event TariffsUpdated(address cpo);

    function addLocation(bytes32 scId, bytes32 externalHash) public {
        require(CPOs[msg.sender].locations[scId] == bytes32(0), "Location with that Share & Charge ID already exists");
        CPOs[msg.sender].locations[scId] = externalHash;
        CPOs[msg.sender].scIds.push(scId);
        ownerOf[scId] = msg.sender;
        emit LocationAdded(msg.sender, scId);
    }

    function updateLocation(bytes32 scId, bytes32 newHash) public {
        require(CPOs[msg.sender].locations[scId] != bytes32(0), "Location with that Share & Charge ID does not exist");
        CPOs[msg.sender].locations[scId] = newHash;
        if (newHash == bytes32(0)) {
            emit LocationDeleted(msg.sender, scId);
        } else {
            emit LocationUpdated(msg.sender, scId);
        }
    }

    function addTariffs(bytes32 externalHash) public {
        require(CPOs[msg.sender].tariffs == bytes32(0), "Tariffs already exist for this Charge Point Operator");
        CPOs[msg.sender].tariffs = externalHash;
        emit TariffsAdded(msg.sender);
    }

    function updateTariffs(bytes32 newHash) public {
        require(CPOs[msg.sender].tariffs != bytes32(0), "No tariffs found for this Charge Point Operator");
        CPOs[msg.sender].tariffs = newHash;
        emit TariffsUpdated(msg.sender);
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