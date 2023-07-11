// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IPositionManager.sol";
import "./Libraries/PriceMath.sol";
import "./Libraries/LiquidityAmounts.sol";
import "./Oracle/IOracle.sol";

contract LmPoolV3withReserver {
    IERC20 public immutable token0;
    IERC20 public immutable token1;
    IPositionManager public NFTPositionManager;
    IOracle public oracle;

    // How much token 0 and token 1 in the contract.
    uint256 public reserve0; // Real Amount Token 0 on Contract
    uint256 public reserve1; // Real Amount Token 1 on Contract
    uint256 public reserveMoney0; // reserve money for Token 0
    uint256 public reserveMoney1; // reserve money for Token 0
    uint256 public fee;

    // Collect Fee
    uint256 public totalFee0;
    uint256 public totalFee1;

    // Total Liquidity of Pool:
    uint128 public liquidityOfPool;
    mapping(address => uint128) public liquidityDelta;
    uint256 public totalSupply; // keep tract total shares
    mapping(address => uint256) public balanceOf;

    constructor(
        address _token0,
        address _token1,
        address _NFTPositionManager,
        address _oracle,
        uint256 _fee
    ) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        NFTPositionManager = IPositionManager(_NFTPositionManager);
        oracle = IOracle(_oracle);
        fee = _fee;
    }

    function _mint(address _to, uint256 _amount) private {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }

    function _burn(address _from, uint256 _amount) private {
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
    }

    function _update(uint256 _reserve0, uint256 _reserve1) private {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
    }

    function notifyReserverMoney(uint256 _amount0, uint256 _amount1) public {
        reserveMoney0 += _amount0;
        reserveMoney1 += _amount1;
    }

    function swap(address _tokenIn, uint256 _amountIn)
        external
        returns (uint256 amountOut)
    {
        require(
            _tokenIn == address(token0) || _tokenIn == address(token1),
            "Invalide Token"
        );
        require(_amountIn > 0, "amount in = 0");

        // pull in token in
        bool isToken0 = _tokenIn == address(token0);

        (
            IERC20 tokenIn,
            IERC20 tokenOut,
            uint256 resIn,
            uint256 resOut
        ) = isToken0
                ? (token0, token1, reserve0, reserve1)
                : (token1, token0, reserve1, reserve0);

        tokenIn.transferFrom(msg.sender, address(this), _amountIn);
        // calculate token out (include fees), fee 0.3%
        /* 
            ydx / (x + dx) = dy
            y = amount of token out inside the contract
            dx = amount of token in
            x = amount of token in inside the contract
            dy = amount of token out that is send for msg.seder
        */
        uint256 amountInWithFee = (_amountIn * (1000 - fee)) / 1000;

        if (isToken0) {
            totalFee0 += (_amountIn * fee) / 1000;
        } else {
            totalFee1 += (_amountIn * fee) / 1000;
        }

        amountOut = (resOut * amountInWithFee) / (resIn + amountInWithFee);
        // Transfer token out to msg.sender
        tokenOut.transfer(msg.sender, amountOut);
        // update the reserve
        _update(
            token0.balanceOf(address(this)) - totalFee0 - reserveMoney0,
            token1.balanceOf(address(this)) - totalFee1 - reserveMoney1
        );
    }

    function _sqrtX96Convert(int256 _lowerPrice, int256 _upperPrice)
        internal
        view
        returns (
            uint160 sqrtRatioAX96,
            uint160 sqrtRatioBX96,
            uint160 sqrtRatioX96
        )
    {
        sqrtRatioAX96 = PriceMath.priceToSqrtPriceX96(_lowerPrice);
        sqrtRatioBX96 = PriceMath.priceToSqrtPriceX96(_upperPrice);
        sqrtRatioX96 = PriceMath.priceToSqrtPriceX96(oracle.getLINKETHPrice());
    }

    function _quoteForAmount0(
        uint256 _amount0,
        int256 _upperPrice,
        int256 _lowerPrice
    ) external view returns (uint256) {
        (
            uint160 sqrtRatioAX96,
            uint160 sqrtRatioBX96,
            uint160 sqrtRatioX96
        ) = _sqrtX96Convert(_lowerPrice, _upperPrice);

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmount0(
            sqrtRatioX96,
            sqrtRatioBX96,
            _amount0
        );

        uint256 amount1 = LiquidityAmounts.getAmount1ForLiquidity(
            sqrtRatioAX96,
            sqrtRatioX96,
            liquidity
        );

        return amount1;
    }

    function _quoteForAmount1(
        uint256 _amount1,
        int256 _upperPrice,
        int256 _lowerPrice
    ) external view returns (uint256) {
        (
            uint160 sqrtRatioAX96,
            uint160 sqrtRatioBX96,
            uint160 sqrtRatioX96
        ) = _sqrtX96Convert(_lowerPrice, _upperPrice);

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmount1(
            sqrtRatioAX96,
            sqrtRatioX96,
            _amount1
        );

        uint256 amount0 = LiquidityAmounts.getAmount0ForLiquidity(
            sqrtRatioX96,
            sqrtRatioBX96,
            liquidity
        );

        return amount0;
    }

    function getLiquidityForAmounts(
        uint256 _amount0,
        uint256 _amount1,
        int256 _upperPrice,
        int256 _lowerPrice
    ) public view returns (uint128) {
        (
            uint160 sqrtRatioAX96,
            uint160 sqrtRatioBX96,
            uint160 sqrtRatioX96
        ) = _sqrtX96Convert(_lowerPrice, _upperPrice);

        return
            LiquidityAmounts.getLiquidityForAmounts(
                sqrtRatioX96,
                sqrtRatioAX96,
                sqrtRatioBX96,
                _amount0,
                _amount1
            );
    }

    function getAmountsForLiquidity(
        uint160 sqrtRatioX96,
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint128 _liquidity
    ) public pure returns (uint256 amount0, uint256 amount1) {
        return
            LiquidityAmounts.getAmountsForLiquidity(
                sqrtRatioX96,
                sqrtRatioAX96,
                sqrtRatioBX96,
                _liquidity
            );
    }

    function addLiquidity(
        uint256 _amount0,
        uint256 _amount1,
        int256 _upperPrice,
        int256 _lowerPrice
    ) external returns (uint256 shares) {
        // Pull in token0 and token1
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);

        {
            // Calculate Delta Liquidity:
            uint128 deltaLiquidity = getLiquidityForAmounts(
                _amount0,
                _amount1,
                _upperPrice,
                _lowerPrice
            );

            liquidityOfPool += deltaLiquidity;
            liquidityDelta[msg.sender] = deltaLiquidity;

            // Mint shares
            // f(x,y) = value of liquidity = sqrt(xy)
            // s = dx / x * T = dy / y * T
            if (totalSupply == 0) {
                shares = deltaLiquidity;
            } else {
                shares = _min(
                    (_amount0 * totalSupply) / (reserve0),
                    (_amount1 * totalSupply) / (reserve1)
                );
            }

            require(shares > 0, "shares = 0");
            _mint(msg.sender, shares);
        }

        // sqrtPrice convert
        (uint160 sqrtRatioAX96, uint160 sqrtRatioBX96, ) = _sqrtX96Convert(
            _lowerPrice,
            _upperPrice
        );

        IPositionManager.PositionInfo memory position = NFTPositionManager
            .mintParams(
                shares,
                msg.sender,
                address(token0),
                address(token1),
                fee,
                _amount0,
                _amount1,
                sqrtRatioBX96,
                sqrtRatioAX96,
                liquidityDelta[msg.sender]
            );

        NFTPositionManager.mintPosition(msg.sender, position);

        // update the reserve
        _update(
            token0.balanceOf(address(this)) - totalFee0 - reserveMoney0,
            token1.balanceOf(address(this)) - totalFee1 - reserveMoney1
        );
    }

    function removeLiquidity(uint256 _tokenId)
        external
        returns (uint256 amount0, uint256 amount1)
    {
        // Transfer Position NFT to contract
        NFTPositionManager.transferPosition(
            msg.sender,
            address(this),
            _tokenId
        );

        // Check Shares for Position NFT
        uint256 _shares = NFTPositionManager.positions(_tokenId).shares;
        uint160 _upperPrice = NFTPositionManager.positions(_tokenId).upperTick;
        uint160 _lowerPrice = NFTPositionManager.positions(_tokenId).lowerTick;
        uint128 _liquidity = NFTPositionManager
            .positions(_tokenId)
            .deltaLiquidity;

        // Burn shares
        _burn(msg.sender, _shares);
        NFTPositionManager.burnPosition(_tokenId, address(this));

        // Calculate amount0, amount1 by deltaliquidity, Price range and current Price
        (, , uint160 sqrtRatioX96) = _sqrtX96Convert(0, 0);

        (amount0, amount1) = getAmountsForLiquidity(
            sqrtRatioX96,
            _lowerPrice,
            _upperPrice,
            _liquidity
        );

        liquidityOfPool -= _liquidity;

        // Update reserves
        uint256 bal0 = token0.balanceOf(address(this));
        uint256 bal1 = token1.balanceOf(address(this));

        if (amount0 > reserve0) {
            uint256 deficit = amount0 - reserve0;
            reserveMoney0 -= deficit;
            uint256 modifyRes0 = 0; 
            uint256 modifyRes1 = bal1 - amount1 - totalFee1 - reserveMoney1;
            _update(modifyRes0, modifyRes1);
        } else if (amount1 > reserve1) {
            uint256 deficit = amount1 - reserve1;
            reserveMoney1 -= deficit;
            uint256 modifyRes0 = bal0 - amount0 - totalFee0 - reserveMoney0;
            uint256 modifyRes1 = 0;
            _update(modifyRes0, modifyRes1);
        } else {
            uint256 modifyRes0 = bal0 - amount0 - totalFee0 - reserveMoney0;
            uint256 modifyRes1 = bal1 - amount1 - totalFee1 - reserveMoney1;
            _update(modifyRes0, modifyRes1);
        }

        // Tranfer tokens to msg.sender
        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
    }

    // Uniswap code base.
    function _sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
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
}
