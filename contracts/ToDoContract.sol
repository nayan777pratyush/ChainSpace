// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract ToDoContract {
    struct Todo {
        uint256 id;
        string text;
        bool completed;
    }

    uint256 public nextId;
    mapping(address => Todo[]) private todos;

    event TodoCreated(
        address indexed owner,
        uint256 indexed id,
        string text
    );

    event TodoToggled(
        address indexed owner,
        uint256 indexed id,
        bool completed
    );

    function createTodo(string calldata text) external {
        require(bytes(text).length > 0, "Todo cannot be empty");

        todos[msg.sender].push(
            Todo(nextId, text, false)
        );

        emit TodoCreated(msg.sender, nextId, text);
        nextId++;
    }

    function toggleTodo(uint256 id) external {
        Todo[] storage userTodos = todos[msg.sender];

        for (uint256 i = 0; i < userTodos.length; i++) {
            if (userTodos[i].id == id) {
                userTodos[i].completed = !userTodos[i].completed;

                emit TodoToggled(
                    msg.sender,
                    id,
                    userTodos[i].completed
                );

                return;
            }
        }

        revert("Todo not found");
    }

    function getTodos()
        external
        view
        returns (Todo[] memory)
    {
        return todos[msg.sender];
    }
}