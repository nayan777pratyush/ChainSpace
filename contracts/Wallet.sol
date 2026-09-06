// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Wallet {
    event Deposit(
        address indexed from,
        uint256 amount
    );

    event Withdrawal(
        address indexed to,
        uint256 amount
    );

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
        require(
            amount <= address(this).balance,
            "Insufficient wallet balance"
        );

        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }
}