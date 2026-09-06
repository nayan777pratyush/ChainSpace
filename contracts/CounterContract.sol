// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract CounterContract {
    uint256 public counter;

    event CounterChanged(
        address indexed changedBy,
        uint256 newValue
    );

    constructor(uint256 count) {
        counter = count;
    }

    function addValue() public {
        counter += 1;
        emit CounterChanged(msg.sender, counter);
    }

    function getCount() public view returns (uint256) {
        return counter;
    }

    function removeValue() public {
        require(counter > 0, "Value is already zero");
        counter -= 1;
        emit CounterChanged(msg.sender, counter);
    }
}