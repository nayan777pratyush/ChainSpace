// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract DocumentRegistry {
    mapping(string => uint256) private documents;
    address public immutable contractOwner;

    event DocumentAdded(
        string indexed documentHash,
        uint256 timestamp
    );

    constructor() {
        contractOwner = msg.sender;
    }

    function addDocument(string memory hash)
        public
        returns (uint256 timestamp)
    {
        require(
            msg.sender == contractOwner,
            "Not an owner"
        );
        require(bytes(hash).length > 0, "Hash cannot be empty");

        documents[hash] = block.timestamp;

        emit DocumentAdded(hash, block.timestamp);

        return block.timestamp;
    }

    function verifyDocument(string memory hash)
        public
        view
        returns (uint256)
    {
        return documents[hash];
    }
}