// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TouristID is Ownable {
    struct TouristInfo {
        uint256 tripStartDate;
        uint256 tripEndDate;
        string emergencyContact;
        bool exists; // To check if the ID exists
    }

    // Maps a unique ID (Aadhaar/Passport) to their info
    mapping(string => TouristInfo) public touristInfos;
    // Maps a blockchain ID to their unique ID
    mapping(uint256 => string) public blockchainIdToPersonalId;

    event TouristRegistered(uint256 indexed blockchainId, string personalId);

    // Add a constructor and pass msg.sender to Ownable
    constructor() Ownable(msg.sender) {}

    function registerTourist(
        string memory _personalId,
        uint256 _tripStartDate,
        uint256 _tripEndDate,
        string memory _emergencyContact
    ) external onlyOwner {
        require(!touristInfos[_personalId].exists, "Tourist already registered");

        uint256 newId = block.timestamp;
        
        touristInfos[_personalId] = TouristInfo(
            _tripStartDate,
            _tripEndDate,
            _emergencyContact,
            true
        );

        blockchainIdToPersonalId[newId] = _personalId;
        
        emit TouristRegistered(newId, _personalId);
    }

    function getTouristInfo(string memory _personalId)
        external
        view
        returns (uint256, uint256, string memory)
    {
        require(touristInfos[_personalId].exists, "Tourist not found");
        TouristInfo storage info = touristInfos[_personalId];
        return (info.tripStartDate, info.tripEndDate, info.emergencyContact);
    }
}
