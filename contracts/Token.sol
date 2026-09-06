// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Token {
    string public constant name = "LinkToken";
    string public constant symbol = "LT";
    uint8 public constant decimals = 0;
    uint256 public totalSupply;

    mapping(address => uint256) public balances;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;
        balances[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function transfer(address _to, uint256 amount) external {
        require(_to != address(0), "Cannot transfer to zero address");
        require(balances[msg.sender] >= amount, "Not enough tokens");

        balances[msg.sender] -= amount;
        balances[_to] += amount;

        emit Transfer(msg.sender, _to, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}