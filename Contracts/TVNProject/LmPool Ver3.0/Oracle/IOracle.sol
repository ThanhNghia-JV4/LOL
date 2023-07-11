// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOracle {
    function getLINKUSDPrice() external view returns (int256);

    function getETHUSDPrice() external view returns (int256);

    function getLINKETHPrice() external view returns (int256);
}
