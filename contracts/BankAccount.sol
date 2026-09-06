// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract BankAccount {
    uint256 public totalContractBalance;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public depositTimestamps;

    event Deposit(
        address indexed account,
        uint256 amount,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed account,
        uint256 amount
    );

    function getContractBalance() public view returns (uint256) {
        return totalContractBalance;
    }

    function addBalance() public payable {
        require(msg.value > 0, "Amount should be more than zero");

        balances[msg.sender] += msg.value;
        totalContractBalance += msg.value;
        depositTimestamps[msg.sender] = block.timestamp;

        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    function getBalance(address userAddress)
        public
        view
        returns (uint256)
    {
        uint256 principal = balances[userAddress];

        if (principal == 0) {
            return 0;
        }

        uint256 timeElapsed =
            block.timestamp - depositTimestamps[userAddress];

        // Simple 7% annual interest, calculated by elapsed seconds.
        uint256 interest =
            (principal * 7 * timeElapsed) /
            (100 * 365 days);

        return principal + interest;
    }

    function withdraw() public {
        uint256 withdrawAmount = getBalance(msg.sender);

        require(withdrawAmount > 0, "No balance to withdraw");
        require(
            address(this).balance >= withdrawAmount,
            "Contract liquidity is insufficient"
        );

        balances[msg.sender] = 0;
        depositTimestamps[msg.sender] = 0;
        totalContractBalance -=
            withdrawAmount > totalContractBalance
                ? totalContractBalance
                : withdrawAmount;

        payable(msg.sender).transfer(withdrawAmount);

        emit Withdrawal(msg.sender, withdrawAmount);
    }
}