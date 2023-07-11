// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IPositionManager {
    struct PositionInfo {
        uint256 shares;
        address owner;
        address token0;
        address token1;
        uint256 fee;
        uint256 amount0;
        uint256 amount1;
    }

    function positions(uint256) external returns (PositionInfo memory);

    function transferPosition(
        address _from,
        address _to,
        uint256 _tokenId
    ) external;

    function mintPosition(address _to, PositionInfo calldata params) external;

    function burnPosition(uint256 _tokenId, address _from) external;

    function mintParams(
        uint256 _shares,
        address _owner,
        address _token0,
        address _token1,
        uint256 _fee,
        uint256 _amount0,
        uint256 _amount1
    ) external pure returns (PositionInfo memory);
}
