/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Center,
  Divider,
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
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Sepolia } from "../../Constants";
import PositionNFTABI from "../../Services/ABI/TVNNFTPositionManager.json";
import StakingABI from "../../Services/ABI/TVNStakingPool.json";
import { AiFillCheckCircle } from "react-icons/ai";

const HarvestCard = ({ tokenId, LINKPrice, ETHPrice }) => {
  const toast = useToast();
  const [position, setPosition] = useState({});
  const [reward, setReward] = useState(0);
  const [rewardPerSecond, setRewardPerSecond] = useState(0);

  const [yourAddress, setYourAddress] = useState(0);

  const address = useAddress(0);

  const { contract: PositionNFTContract } = useContract(
    Sepolia.NFTPos,
    PositionNFTABI.abi
  );

  const { contract: StakingPoolContract } = useContract(
    Sepolia.StakingPool,
    StakingABI.abi
  );

  const { data: positionInfo } = useContractRead(
    PositionNFTContract,
    "positions",
    [`${tokenId}`]
  );

  const { data: amount0 } = useContractRead(StakingPoolContract, "amount0", []);

  const { data: amount1 } = useContractRead(StakingPoolContract, "amount1", []);

  const { data: rewardRate } = useContractRead(
    StakingPoolContract,
    "rewardRate",
    []
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

    if (rewardRate != undefined) {
      setRewardPerSecond(ethers.utils.formatUnits(rewardRate, 18));
    }
  }, [positionInfo, address, rewardRate]);

  useEffect(() => {
    const fetchReward = async () => {
      const reward = await StakingPoolContract.call("earned", [tokenId]);
      setReward(ethers.utils.formatUnits(reward, 18));
    };

    fetchReward();

    const interval = setInterval(fetchReward, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleHarvest = async (contract) => {
    if (reward <= 0) return;
    await contract.call("getReward", [tokenId]);
  };

  const handleUnstake = async (contract) => {
    await contract.call("unstake", [`${tokenId}`]);
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
        <Box display={"flex"} flexDirection={"column"} w={"100%"}>
          <Text fontSize={"xl"} fontWeight={"bold"}>
            LINK-ETH LP (#{tokenId})
          </Text>
          <Text fontWeight={"bold"}>
            Tối thiểu {position?.lowerPrice} / tối đa {position?.upperPrice}{" "}
            ETH/LINK
          </Text>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            w={"100%"}
          >
            <Box>
              <Text fontWeight={"bold"} my={4}>
                APR:{" "}
                {(
                  ((+position?.amount0 * LINKPrice +
                    +position?.amount1 * ETHPrice) /
                    ((+amount0 / 1e18) * LINKPrice +
                      (+amount1 / 1e18) * ETHPrice)) *
                  ((+rewardPerSecond * 86400 * 365 * 100) /
                    ((+amount0 / 1e18) * LINKPrice +
                      (+amount1 / 1e18) * ETHPrice))
                ).toFixed(2)}{" "}
                %
              </Text>
              <Text>
                ~{" "}
                {(
                  +position?.amount0 * LINKPrice +
                  +position?.amount1 * ETHPrice
                ).toFixed(2)}{" "}
                USD
              </Text>
              <Text>
                {position?.amount0} LINK - {position?.amount1} ETH
              </Text>
            </Box>
            <Web3Button
              contractAddress={Sepolia.StakingPool}
              contractAbi={StakingABI.abi}
              action={handleUnstake}
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
                        w={"50%"}
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
                          Hủy Đặt Cọc Thành Công!
                        </Text>
                      </Center>
                    </Box>
                  ),
                });
                window.location.reload();
              }}
              className="button_staking-unstake" // Logic to execute when clicked
            >
              Hủy Đặt Cọc
            </Web3Button>
          </Box>
        </Box>
      </Box>
      <Center height={"200px"}>
        <Divider orientation="vertical" />
      </Center>
      <Box
        w={"50%"}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"end"}
      >
        <Box display={"flex"} flexDirection={"column"} w={"100%"}>
          <Text pt={"15px"}>Số Lượng TVN Kiếm Được</Text>
          <Text fontSize={"6xl"} mt={2} fontWeight={"bold"}>
            {reward ? (+reward).toFixed(3) : 0}
          </Text>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"end"}
            w={"100%"}
          >
            <Web3Button
              contractAddress={Sepolia.StakingPool}
              contractAbi={StakingABI.abi}
              action={handleHarvest}
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
                        w={"50%"}
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
                          Thu Hoạch Thành Công!
                        </Text>
                      </Center>
                    </Box>
                  ),
                });
                window.location.reload();
              }}
              className="button_staking-harvest" // Logic to execute when clicked
            >
              Thu Hoạch
            </Web3Button>
          </Box>
        </Box>
      </Box>
    </SimpleGrid>
  );
};

export default HarvestCard;
