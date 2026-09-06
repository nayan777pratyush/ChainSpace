// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Greeter {
    string private greeting;

    event GreetingChanged(
        address indexed changedBy,
        string oldGreeting,
        string newGreeting
    );

    constructor(string memory _greeting) {
        greeting = _greeting;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        require(bytes(_greeting).length > 0, "Greeting cannot be empty");

        string memory oldGreeting = greeting;
        greeting = _greeting;

        emit GreetingChanged(msg.sender, oldGreeting, _greeting);
    }
}