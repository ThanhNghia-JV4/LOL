// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FixedPoint96.sol";
import "./TickMath.sol";
import "./sqrtMath.sol";

library PriceMath {
    function sqrtPriceX96ToPrice(uint160 sqrtPriceX96)
        public
        pure
        returns (uint256)
    {
        uint160 price = uint160((sqrtPriceX96 / FixedPoint96.Q96)**2);
        uint256 priceConverted = uint256(price);

        return priceConverted;
    }

    function priceToSqrtPriceX96(int256 price) public pure returns (uint160) {
        uint256 sqrtPriceX96 = uint256(Math.sqrt(uint256(price))) *
            FixedPoint96.Q96;
        uint160 sqrtPriceX96Converted = uint160(sqrtPriceX96);

        return sqrtPriceX96Converted;
    }

    function sqrtPriceX96ToTick(uint160 price) public pure returns (int24) {
        return TickMath.getTickAtSqrtRatio(price);
    }

    function tickToSqrtPriceX96(int24 tick) public pure returns (uint160) {
        return TickMath.getSqrtRatioAtTick(tick);
    }

    function sqrtPrice(uint256 price) public pure returns (uint256) {
        return Math.sqrt(price);
    }
}
