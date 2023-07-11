// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Oracle {
    AggregatorV3Interface internal LINKUSDPrice;
    AggregatorV3Interface internal ETHUSDPrice;
    AggregatorV3Interface internal LINKETHPrice;

    constructor() {
        LINKUSDPrice = AggregatorV3Interface(
            0xc59E3633BAAC79493d908e63626716e204A45EdF
        );
        ETHUSDPrice = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        LINKETHPrice = AggregatorV3Interface(
            0x42585eD362B3f1BCa95c640FdFf35Ef899212734
        );
    }

    function getLINKUSDPrice() public view returns (int256) {
        (, int256 price, , , ) = LINKUSDPrice.latestRoundData();

        return price;
    }

    function getETHUSDPrice() public view returns (int256) {
        (, int256 price, , , ) = ETHUSDPrice.latestRoundData();

        return price;
    }

    function getLINKETHPrice() public view returns (int256) {
        (, int256 price, , , ) = LINKETHPrice.latestRoundData();

        return price;
    }
}
