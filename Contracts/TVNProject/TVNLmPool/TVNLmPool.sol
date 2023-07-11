// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../TVNNFTPositionManager/IPositionManager.sol";

contract TVNLmPool {
    /*
        Marker maker using X*Y = K
    */
    IERC20 public immutable token0;
    IERC20 public immutable token1;
    IPositionManager public NFTPositionManager;

    // How much token 0 and token 1 in the contract.
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public fee;

    // Collect Fee
    uint256 public totalFee0;
    uint256 public totalFee1;

    uint256 public totalSupply; // keep tract total shares
    mapping(address => uint256) public balanceOf;

    constructor(
        address _token0,
        address _token1,
        address _NFTPositionManager,
        uint256 _fee
    ) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        NFTPositionManager = IPositionManager(_NFTPositionManager);
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
            token0.balanceOf(address(this)) - totalFee0,
            token1.balanceOf(address(this)) - totalFee1
        );
    }

    function _quote(uint256 _amount0) external view returns (uint256) {
        uint256 modifyReserve0 = reserve0 - totalFee0;
        uint256 modifyReserve1 = reserve1 - totalFee1;

        uint256 amount1 = (modifyReserve1 * _amount0) / modifyReserve0;
        return amount1;
    }

    function addLiquidity(uint256 _amount0, uint256 _amount1)
        external
        returns (uint256 shares)
    {
        // Pull in token0 and token1
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);
        // dy / dx = y / x
        if (reserve0 > 0 || reserve1 > 0) {
            uint256 modifyReserve0 = reserve0 - totalFee0;
            uint256 modifyReserve1 = reserve1 - totalFee1;
            require(
                _amount1 == (modifyReserve1 * _amount0) / modifyReserve0,
                "dy / dx != y / x"
            );
        }

        // Mint shares
        // f(x,y) = value of liquidity = sqrt(xy)
        // s = dx / x * T = dy / y * T
        if (totalSupply == 0) {
            shares = _sqrt(_amount0 * _amount1);
        } else {
            shares = _min(
                (_amount0 * totalSupply) / (reserve0),
                (_amount1 * totalSupply) / (reserve1)
            );
        }
        require(shares > 0, "shares = 0");
        _mint(msg.sender, shares);
        NFTPositionManager.mintPosition(
            msg.sender,
            NFTPositionManager.mintParams(
                shares,
                msg.sender,
                address(token0),
                address(token1),
                fee,
                _amount0,
                _amount1
            )
        );
        // Update reserves
        _update(
            token0.balanceOf(address(this)) - totalFee0,
            token1.balanceOf(address(this)) - totalFee1
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

        // amount0 and amount1 to withdraw
        // dx = s / T * x
        // dy = s / T * y
        uint256 bal0 = token0.balanceOf(address(this));
        uint256 bal1 = token1.balanceOf(address(this));

        amount0 = (_shares * bal0) / totalSupply;
        amount1 = (_shares * bal1) / totalSupply;
        require(amount0 > 0 && amount1 > 1, "amount0 or amount1 = 0");
        // Burn shares
        _burn(msg.sender, _shares);
        NFTPositionManager.burnPosition(_tokenId, address(this));
        // Update reserves
        _update(bal0 - amount0 - totalFee0, bal1 - amount1 - totalFee1);
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
