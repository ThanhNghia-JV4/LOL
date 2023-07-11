/* eslint-disable react/prop-types */
import {
  Box,
  Center,
  Icon,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  Web3Button,
  useAddress,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react";
import { Sepolia } from "../../Constants";
import PositionNFTABI from "../../Services/ABI/TVNNFTPositionManager.json";
import StakingABI from "../../Services/ABI/TVNStakingPool.json";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { AiFillCheckCircle } from "react-icons/ai";

const StakingCard = ({ tokenId, LINKPrice, ETHPrice }) => {
  const toast = useToast();
  const [position, setPosition] = useState({});
  const [linkusd, setLinkusd] = useState(0);
  const [ethusd, setEthusd] = useState(0);

  const [yourAddress, setYourAddress] = useState(0);

  const address = useAddress(0);

  const { contract: PositionNFTContract } = useContract(
    Sepolia.NFTPos,
    PositionNFTABI.abi
  );

  const { data: positionInfo } = useContractRead(
    PositionNFTContract,
    "positions",
    [`${tokenId}`]
  );

  const formatSqrtPriceX96 = (sqrtPrice) => {
    let price = sqrtPrice / 2 ** 96;
    price = price ** 2 / 1e18;
    return price.toFixed(6);
  };

  useEffect(() => {
    if (positionInfo != undefined) {
      const modifyPosition = {
        amount0: (+ethers.utils.formatUnits(positionInfo.amount0, 18)).toFixed(
          3
        ),
        amount1: (+ethers.utils.formatUnits(positionInfo.amount1, 18)).toFixed(
          3
        ),
        lowerPrice: formatSqrtPriceX96(positionInfo.lowerTick),
        upperPrice: formatSqrtPriceX96(positionInfo.upperTick),
      };
      setPosition(modifyPosition);
    }

    if (address != undefined) {
      setYourAddress(address);
    }

    if (LINKPrice != undefined) {
      setLinkusd(LINKPrice);
    }

    if (ETHPrice != undefined) {
      setEthusd(ETHPrice);
    }
  }, [positionInfo, address, LINKPrice, ETHPrice]);

  const handleStaking = async (contract) => {
    const allowance = await PositionNFTContract.call("isApprovalForAll", [
      `${yourAddress}`,
      `${Sepolia.StakingPool}`,
    ]);

    if (!allowance) {
      await PositionNFTContract.call("setApprovalForAll", [
        `${Sepolia.StakingPool}`,
        true,
      ]);
    }

    await contract.call("stake", [tokenId]);
  };

  return (
    <SimpleGrid
      columns={2}
      gap={10}
      border={"2px"}
      borderColor={"gray.300"}
      borderRadius={20}
      p={6}
      w={"100%"}
      display={"flex"}
      justifyContent={"start"}
      color={"rgb(40,13,95)"}
    >
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"start"}
        justifyContent={"center"}
        w={"50%"}
      >
        <Text fontSize={"xl"} fontWeight={"bold"}>
          LINK-ETH LP (#{tokenId})
        </Text>
        <Text fontWeight={"bold"}>
          Tối thiểu {position?.lowerPrice} / tối đa {position?.upperPrice}{" "}
          ETH/LINK
        </Text>
        <Text fontWeight={"bold"} my={4}>
          APR: 0.0%
        </Text>
        <Text>
          ~ {(+position?.amount0 * linkusd + +position?.amount1 * ethusd).toFixed(2)} USD
        </Text>
        <Text>
          {position?.amount0} LINK - {position?.amount1} ETH
        </Text>
      </Box>
      <Box
        w={"50%"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"end"}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"end"}
          w={"100%"}
        >
          <Web3Button
            contractAddress={Sepolia.StakingPool}
            contractAbi={StakingABI.abi}
            action={handleStaking} // Logic to execute when clicked
            onSuccess={() => {
              toast({
                position: "top-right",
                render: () => (
                  <Box
                    color="white"
                    fontWeight={"bold"}
                    display={"flex"}
                    justifyContent={"start"}
                    border={"1px"}
                    borderColor={"gray.300"}
                    borderRadius={"15px"}
                  >
                    <Center
                      bg={"white"}
                      w={"30%"}
                      p={6}
                      borderTopLeftRadius={"15px"}
                      borderBottomLeftRadius={"15px"}
                    >
                      <Icon
                        as={AiFillCheckCircle}
                        boxSize={8}
                        color={"rgb(31, 199, 212)"}
                      />
                    </Center>
                    <Center p={6} bg="rgb(31, 199, 212)" w={"100%"}>
                      <Text fontSize={"md"} textAlign={"center"}>
                        Đặt Cọc Thành Công!
                      </Text>
                    </Center>
                  </Box>
                ),
              });
              window.location.reload();
            }}
            className="button_staking-pool"
          >
            Đặt Cọc
          </Web3Button>
        </Box>
      </Box>
    </SimpleGrid>
  );
};

export default StakingCard;
