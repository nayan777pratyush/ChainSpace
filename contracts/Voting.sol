// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract VotingApp {
    address[] public candidateList;
    mapping(address => uint256) public votesReceived;

    event VoteCast(
        address indexed voter,
        address indexed candidate,
        uint256 totalVotes
    );

    constructor(address[] memory candidateNames) {
        require(candidateNames.length > 0, "At least one candidate required");
        candidateList = candidateNames;
    }

    function totalVotesFor(address candidate)
        public
        view
        returns (uint256)
    {
        require(validateCandidate(candidate), "Not a valid candidate");
        return votesReceived[candidate];
    }

    function voteForCandidates(address candidate) public {
        require(validateCandidate(candidate), "Not a valid candidate");

        votesReceived[candidate] += 1;

        emit VoteCast(
            msg.sender,
            candidate,
            votesReceived[candidate]
        );
    }

    function validateCandidate(address candidate)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < candidateList.length; i++) {
            if (candidateList[i] == candidate) {
                return true;
            }
        }

        return false;
    }

    function getCandidates() public view returns (address[] memory) {
        return candidateList;
    }
}