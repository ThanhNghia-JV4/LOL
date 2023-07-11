// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ERC721.sol";
import "./IPositionManager.sol";

contract TVNNFTPositionManager is ERC721 {
    string private name;
    string private symbol;
    uint256 public tokenIdNext = 1;

    struct PositionInfo {
        uint256 shares;
        address owner;
        address token0;
        address token1;
        uint256 fee;
        uint256 amount0;
        uint256 amount1;
        uint160 upperTick;
        uint160 lowerTick;
        uint128 deltaLiquidity;
    }

    mapping(uint256 => PositionInfo) public positions;

    mapping(address => uint256[]) public ownerNFT;
    mapping(address => mapping(uint256 => uint256)) public indexOfOwnerNFT;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function mintParams(
        uint256 _shares,
        address _owner,
        address _token0,
        address _token1,
        uint256 _fee,
        uint256 _amount0,
        uint256 _amount1,
        uint160 _upperTick,
        uint160 _lowerTick,
        uint128 _deltaLiquidity
    ) external pure returns (PositionInfo memory) {
        PositionInfo memory position = PositionInfo({
            shares: _shares,
            owner: _owner,
            token0: _token0,
            token1: _token1,
            fee: _fee,
            amount0: _amount0,
            amount1: _amount1,
            upperTick: _upperTick,
            lowerTick: _lowerTick,
            deltaLiquidity: _deltaLiquidity
        });

        return position;
    }

    function mintPosition(address _to, PositionInfo calldata params) external {
        _mint(_to, tokenIdNext);

        ownerNFT[_to].push(tokenIdNext);
        indexOfOwnerNFT[_to][tokenIdNext] = ownerNFT[_to].length;

        PositionInfo storage position = positions[tokenIdNext];

        position.shares = params.shares;
        position.owner = params.owner;
        position.token0 = params.token0;
        position.token1 = params.token1;
        position.fee = params.fee;
        position.amount0 = params.amount0;
        position.amount1 = params.amount1;
        position.upperTick = params.upperTick;
        position.lowerTick = params.lowerTick;
        position.deltaLiquidity = params.deltaLiquidity;

        tokenIdNext++;
    }

    function burnPosition(uint256 _tokenId, address _from) external {
        require(_from == _ownerOf[_tokenId], "not Owner");
        _burn(_tokenId);

        _removeFromArray(_tokenId, _from);

        delete positions[_tokenId];
    }

    function transferPosition(
        address _from,
        address _to,
        uint256 _tokenId
    ) external {
        transferFrom(_from, _to, _tokenId);

        _removeFromArray(_tokenId, _from);

        ownerNFT[_to].push(_tokenId);
        indexOfOwnerNFT[_to][_tokenId] = ownerNFT[_to].length;
    }

    function _removeFromArray(uint256 _tokenId, address _from) private {
        uint256 index = indexOfOwnerNFT[_from][_tokenId];
        uint256 length = ownerNFT[_from].length;

        if (length == 1) {
            delete ownerNFT[_from];
            indexOfOwnerNFT[_from][_tokenId] = 0;
        } else {
            uint256 lastTokenId = ownerNFT[_from][length - 1];
            ownerNFT[_from][index - 1] = lastTokenId;
            ownerNFT[_from].pop();
            indexOfOwnerNFT[_from][lastTokenId] = index;
            indexOfOwnerNFT[_from][_tokenId] = 0;
        }
    }

    function getOwnerNFT(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        return ownerNFT[_owner];
    }
}
