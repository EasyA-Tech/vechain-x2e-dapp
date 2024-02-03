// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract XToEarn {
    mapping(string => uint256) public deposits;
    mapping(address => mapping(string => bool)) public rewardedUsers; // Now public, allows external visibility
    address public owner;

    event DepositReceived(
        address indexed user,
        uint256 amount,
        string twitterUsername
    );
    event RewardPaid(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function depositAndSubmitUsername(
        string memory twitterUsername
    ) public payable {
        deposits[twitterUsername] += msg.value;
        emit DepositReceived(msg.sender, msg.value, twitterUsername);
    }

    function checkTotalDeposits(
        string memory twitterUsername
    ) public view returns (uint256) {
        return deposits[twitterUsername];
    }

    // Function to reward a user - to be called by the contract owner after verifying the follow
    function rewardUser(
        address user,
        string memory twitterUsername,
        uint256 rewardAmount
    ) public {
        require(msg.sender == owner, "Only the owner can reward users");
        require(
            !rewardedUsers[user][twitterUsername],
            "This address has already been rewarded for following this Twitter account"
        );
        require(
            deposits[twitterUsername] >= rewardAmount,
            "Insufficient funds in pool"
        );

        rewardedUsers[user][twitterUsername] = true;
        deposits[twitterUsername] -= rewardAmount;
        payable(user).transfer(rewardAmount);
        emit RewardPaid(user, rewardAmount);
    }
}