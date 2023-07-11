// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../TVNNFTPositionManager/IPositionManager.sol";

contract TVNStakingPool {
    IPositionManager public immutable stakingNFT;
    IERC20 public immutable rewardsToken;

    address public owner;

    uint256 public duration;
    uint256 public finishAt;
    uint256 public updateAt;
    uint256 public rewardRate;
    uint256 public rewardPertokenStored;

    // Staking info for each TokenId
    mapping(uint256 => uint256) public userRewardPerTokenPaid;
    mapping(uint256 => uint256) public rewards;
    mapping(uint256 => uint256) public balanceOf;

    uint256 public totalSupply;

    // Owner NFT
    mapping(address => uint256[]) public ownedStakingNFT;
    mapping(address => mapping(uint256 => uint256))
        public indexForOwnedStakingNFT;

    // Array storage all TokenId staked into Farm
    uint256[] public allNFT;
    mapping(uint256 => uint256) public NFTIndex;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier updateReward(uint256 _tokenId) {
        rewardPertokenStored = rewardPerToken();
        updateAt = lastTimeRewardApplicable();

        if (_tokenId != 0) {
            rewards[_tokenId] = earned(_tokenId);
            userRewardPerTokenPaid[_tokenId] = rewardPertokenStored;
        }
        _;
    }

    constructor(address _stakingNFT, address _rewardsToken) {
        owner = msg.sender;
        stakingNFT = IPositionManager(_stakingNFT);
        rewardsToken = IERC20(_rewardsToken);
    }

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        require(finishAt < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    // Send reward token to the contract and set reward rate
    function notifyRewardAmount(uint256 _amount)
        external
        onlyOwner
        updateReward(0)
    {
        if (block.timestamp > finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remainingReward = rewardRate * (finishAt - block.timestamp);
            rewardRate = (remainingReward + _amount) / duration;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(
            rewardRate * duration < rewardsToken.balanceOf(address(this)),
            "reward amount > balance"
        );

        finishAt = block.timestamp + duration;
        updateAt = block.timestamp;
    }

    function stake(uint256 _tokenId) external updateReward(_tokenId) {
        require(_tokenId > 0, "tokenId = 0");
        stakingNFT.transferPosition(msg.sender, address(this), _tokenId);

        ownedStakingNFT[msg.sender].push(_tokenId);
        indexForOwnedStakingNFT[msg.sender][_tokenId] =
            ownedStakingNFT[msg.sender].length -
            1;

        balanceOf[_tokenId] += stakingNFT.positions(_tokenId).shares; // Keep track amount of token stake by msg.sender
        totalSupply += stakingNFT.positions(_tokenId).shares; // keep tract amount of token inside the contract

        allNFT.push(_tokenId);
        NFTIndex[_tokenId] = allNFT.length - 1;
    }

    function unstake(uint256 _tokenId) external updateReward(_tokenId) {
        require(_tokenId > 0, "tokenId = 0");

        balanceOf[_tokenId] -= stakingNFT.positions(_tokenId).shares;
        totalSupply -= stakingNFT.positions(_tokenId).shares;

        stakingNFT.transferPosition(address(this), msg.sender, _tokenId);

        getReward(_tokenId);
        _removeFromArray(_tokenId, msg.sender);
        _removeNFTTokenId(_tokenId);
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(block.timestamp, finishAt);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPertokenStored;
        }
        return
            rewardPertokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updateAt) * 1e18) /
            totalSupply;
    }

    // Calculate reward by account
    function earned(uint256 _tokenId) public view returns (uint256) {
        return
            ((balanceOf[_tokenId] *
                (rewardPerToken() - userRewardPerTokenPaid[_tokenId])) / 1e18) +
            rewards[_tokenId];
    }

    function getReward(uint256 _tokenId) public updateReward(_tokenId) {
        uint256 reward = rewards[_tokenId];
        address staker = stakingNFT.positions(_tokenId).owner;

        if (reward > 0) {
            rewards[_tokenId] = 0;
            rewardsToken.transfer(staker, reward);
        }
    }

    function getOwnedStakingNFT() external view returns (uint256[] memory) {
        return ownedStakingNFT[msg.sender];
    }

    function getAllNFTStaking() external view returns (uint256[] memory) {
        return allNFT;
    }

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x > y ? y : x;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external view returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function supportsInterface(bytes4 interfaceID)
        external
        pure
        returns (bool)
    {
        return
            interfaceID == type(IERC721).interfaceId ||
            interfaceID == type(IERC165).interfaceId;
    }

    function _removeFromArray(uint256 _tokenId, address _from) private {
        uint256 index = indexForOwnedStakingNFT[_from][_tokenId];
        uint256 length = ownedStakingNFT[_from].length;

        if (length == 1) {
            delete ownedStakingNFT[_from];
            indexForOwnedStakingNFT[_from][_tokenId] = 0;
        } else {
            uint256 lastTokenId = ownedStakingNFT[_from][length - 1];
            ownedStakingNFT[_from][index] = ownedStakingNFT[_from][length - 1];
            ownedStakingNFT[_from].pop();
            indexForOwnedStakingNFT[_from][lastTokenId] = index;
            indexForOwnedStakingNFT[_from][_tokenId] = 0;
        }
    }

    function _removeNFTTokenId(uint256 _tokenId) private {
        uint256 index = NFTIndex[_tokenId];
        uint256 length = allNFT.length;

        if (length == 1) {
            delete allNFT[0];
            NFTIndex[_tokenId] = 0;
        } else {
            uint256 lastTokenId = allNFT[length - 1];
            allNFT[index] = allNFT[length - 1];
            allNFT.pop();
            NFTIndex[lastTokenId] = index;
            NFTIndex[_tokenId] = 0;
        }
    }

    function _getABIEncodedForHarvest(string memory _func, uint256 _tokenId)
        external
        pure
        returns (bytes memory)
    {
        return abi.encodeWithSignature(_func, _tokenId);
    }
}
