// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Wallet {
    address public immutable owner;

    event Deposit(
        address indexed from,
        uint256 amount
    );

    event Withdrawal(
        address indexed to,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function deposit() external payable {
        require(msg.value > 0, "Send ETH to deposit");
        emit Deposit(msg.sender, msg.value);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(amount <= address(this).balance, "Insufficient wallet balance");

        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }
}
