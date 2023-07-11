// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract TVNMulticall {
    function multiCallForHarvest(address[] calldata targets, bytes[] calldata data)
        external
        returns (bytes[] memory)
    {
        require(targets.length == data.length, "Target length != data length");
        bytes[] memory results = new bytes[](data.length);

        for (uint256 i; i < targets.length; i++) {
            (bool success, bytes memory result) = targets[i].call(
                data[i]
            );
            require(success, "Call failed");
            results[i] = result;
        }

        return results;
    }
}
