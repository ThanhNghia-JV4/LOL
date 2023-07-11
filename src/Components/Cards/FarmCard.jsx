/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {
  Box,
  Center,
  Icon,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineQuestionCircle,
  AiFillCodepenCircle,
  AiFillCheckCircle,
} from "react-icons/ai";
import { BsBoxArrowUpRight } from "react-icons/bs";
import StakingCard from "./StakingCard";
import HarvestCard from "./HarvestCard";
import AddLiquidityCard from "./AddLiquidityCard";
import {
  Web3Button,
  useAddress,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react";
import PositionNFTABI from "../../Services/ABI/TVNNFTPositionManager.json";
import StackingABI from "../../Services/ABI/TVNStakingPool.json";
import LmPoolABI from "../../Services/ABI/LmPoolV3withReserver.json";
import OracleABI from "../../Services/ABI/Oracle.json";
import { Sepolia } from "../../Constants";
import { ethers } from "ethers";
import AddLiquidityModal from "../Modal/AddLiquidityModal";

const FarmCard = ({ isEnd }) => {
  const toast = useToast();
  const [infoCard, setInfoCard] = useState(false);
  const [yourAddress, setYourAddress] = useState(0);
  const [unstakeNFT, setUnstakeNFT] = useState([]);
  const [stakeNFT, setStakeNFT] = useState([]);
  const [totalReward, setTotalReward] = useState(0);
  const [fee0, setFee0] = useState(0);
  const [LINKPrice, setLINKPrice] = useState(0);
  const [ETHPrice, setETHPrice] = useState(0);
  const [rewardPerSecond, setRewardPerSecond] = useState(0);
  const [total0, setTotal0] = useState(0);
  const [total1, setTotal1] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const address = useAddress();

  const { contract: PositionNFTContract } = useContract(
    Sepolia.NFTPos,
    PositionNFTABI.abi
  );

  const { contract: LmPoolContract } = useContract(
    Sepolia.LmPool,
    LmPoolABI.abi
  );

  const { contract: StakingPoolContract } = useContract(
    Sepolia.StakingPool,
    StackingABI.abi
  );

  const { contract: OracleContract } = useContract(
    Sepolia.Oracle,
    OracleABI.abi
  );

  const { data: NFTs } = useContractRead(PositionNFTContract, "getOwnerNFT", [
    `${yourAddress}`,
  ]);

  const { data: NFTStaked } = useContractRead(
    StakingPoolContract,
    "getOwnedStakingNFT",
    [`${yourAddress}`]
  );

  const { data: amount0 } = useContractRead(StakingPoolContract, "amount0", []);

  const { data: amount1 } = useContractRead(StakingPoolContract, "amount1", []);

  const { data: fee } = useContractRead(LmPoolContract, "fee", []);

  const { data: linkusd } = useContractRead(
    OracleContract,
    "getLINKUSDPrice",
    []
  );

  const { data: ethusd } = useContractRead(
    OracleContract,
    "getETHUSDPrice",
    []
  );

  const { data: rewardRate } = useContractRead(
    StakingPoolContract,
    "rewardRate",
    []
  );

  useEffect(() => {
    if (address != undefined) {
      setYourAddress(address);
    }

    if (NFTs != undefined) {
      let modifierNFTs = NFTs.map((item) => {
        return ethers.utils.formatUnits(item, 0);
      });

      setUnstakeNFT(modifierNFTs.sort((a, b) => a - b));
    }

    if (NFTStaked != undefined) {
      let modifierNFTs = NFTStaked.map((item) => {
        return ethers.utils.formatUnits(item, 0);
      });

      setStakeNFT(modifierNFTs.sort((a, b) => a - b));
    }

    if (fee != undefined) {
      setFee0(ethers.utils.formatUnits(fee, 1));
    }

    if (linkusd != undefined) {
      setLINKPrice(ethers.utils.formatUnits(linkusd, 8));
    }

    if (ethusd != undefined) {
      setETHPrice(ethers.utils.formatUnits(ethusd, 8));
    }

    if (rewardRate != undefined) {
      setRewardPerSecond(ethers.utils.formatUnits(rewardRate, 18));
    }

    if (amount0 != undefined) {
      setTotal0((+ethers.utils.formatUnits(amount0, 18)).toFixed(3));
    }

    if (amount1 != undefined) {
      setTotal1((+ethers.utils.formatUnits(amount1, 18)).toFixed(3));
    }
  }, [
    address,
    NFTs,
    NFTStaked,
    amount0,
    amount1,
    fee,
    linkusd,
    ethusd,
    rewardRate,
  ]);

  useEffect(() => {
    const fetchTotalReward = async () => {
      const total = await calculateTotalReward(stakeNFT);
      setTotalReward(+total.toFixed(3));
    };

    fetchTotalReward();
    const interval = setInterval(fetchTotalReward, 60000);

    return () => clearInterval(interval);
  }, [stakeNFT]);

  const handleHarvestAll = async () => {
    const arrayFunc = [];

    for (const el of stakeNFT) {
      const abiEncoded = await StakingPoolContract.call(
        "_getABIEncodedForHarvest",
        ["getReward(uint256)", `${el}`]
      );
      arrayFunc.push(abiEncoded);
    }

    if (arrayFunc.length > 0) {
      await StakingPoolContract.call("multiDelegatecall", [arrayFunc]);
    }
  };

  const calculateTotalReward = async (staked) => {
    let sum = 0;
    for (const el of staked) {
      let reward = await StakingPoolContract.call("earned", [`${el}`]);
      reward = parseFloat(ethers.utils.formatUnits(reward, 18));
      sum += +reward.toFixed(3);
    }

    return sum;
  };

  return (
    <>
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        textAlign={"center"}
        gap={10}
        color={"rgb(40,13,95)"}
        p={10}
        borderBottomRadius={isEnd && !infoCard ? 30 : 0}
        borderBottom={"2px"}
        borderColor={"gray.300"}
      >
        <Box
          display={"flex"}
          justifyContent={"start"}
          justifyItems={"center"}
          textAlign={"center"}
          gap={20}
        >
          <Text
            fontSize={"2xl"}
            fontWeight={"bold"}
            // color={"rgb(40,13,95)"}
            pt={1}
          >
            LINK-ETH LP
          </Text>
          <Text
            // color={"rgb(40,13,95)"}
            borderRadius={40}
            border={"2px"}
            borderColor={"rgb(118,69,217)"}
            py={2}
            px={6}
          >
            {+fee0}%
          </Text>
        </Box>
        <Box
          display={"flex"}
          justifyContent={"start"}
          justifyItems={"center"}
          textAlign={"center"}
          fontSize={"base"}
          gap={20}
        >
          <SimpleGrid row={2} spacing={1}>
            <Text>Thu Nhập</Text>
            <Text>{totalReward} TVN</Text>
          </SimpleGrid>
          <SimpleGrid row={2} spacing={1}>
            <Text>APR</Text>
            <Text>
              {+amount0 != 0
                ? (
                    (rewardPerSecond * 86400 * 365 * 100) /
                    ((+amount0 / 1e18) * LINKPrice +
                      (+amount1 / 1e18) * ETHPrice)
                  ).toFixed(2)
                : 0}{" "}
              %
            </Text>
          </SimpleGrid>
          <SimpleGrid row={2} spacing={1}>
            <Text>Tổng thanh khoản đặt cọc</Text>
            <Text display={"flex"} gap={1} justifyContent={"center"}>
              $
              {+total0 != 0
                ? ((+total0 * LINKPrice) + (+total1 * ETHPrice)).toFixed(2)
                : 0}{" "}
              <Icon
                as={AiOutlineQuestionCircle}
                boxSize={5}
                cursor={"pointer"}
              />
            </Text>
          </SimpleGrid>
          <SimpleGrid row={2} spacing={1} color={"gray.300"}>
            <Text>Hệ số nhân</Text>
            <Text display={"flex"} gap={1} justifyContent={"center"}>
              0x{" "}
              <Icon
                as={AiOutlineQuestionCircle}
                boxSize={5}
                cursor={"pointer"}
              />
            </Text>
          </SimpleGrid>
          <SimpleGrid row={2} spacing={1}>
            <Text>Hiện có</Text>
            <Text>{unstakeNFT.length} LP</Text>
          </SimpleGrid>
          <SimpleGrid row={2} spacing={1}>
            <Text>Đã đặt cọc</Text>
            <Text>{stakeNFT.length} LP</Text>
          </SimpleGrid>
          <Box pt="15px" pr={10}>
            {!infoCard ? (
              <Icon
                as={AiOutlineDown}
                boxSize={5}
                onClick={() => setInfoCard(true)}
                color={"rgb(31,199,212)"}
                cursor={"pointer"}
              />
            ) : (
              <Icon
                as={AiOutlineUp}
                boxSize={5}
                onClick={() => setInfoCard(false)}
                color={"rgb(31,199,212)"}
                cursor={"pointer"}
              />
            )}
          </Box>
        </Box>
      </Box>
      {infoCard && (
        <Box
          p={10}
          bg={"rgb(246,246,246)"}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"start"}
          alignItems={"center"}
          gap={20}
          borderBottomRightRadius={isEnd ? 30 : 0}
          borderBottomLeftRadius={isEnd ? 30 : 0}
        >
          <SimpleGrid
            row={3}
            spacing={2}
            fontWeight={"bold"}
            color={"rgb(42,201,214)"}
            w={"15%"}
          >
            <Text cursor={"pointer"} onClick={onOpen}>
              Thêm LINK-ETH LP
            </Text>
            <Box display={"flex"} gap={2} cursor={"pointer"}>
              <Text>Xem Thông Tin Cặp</Text>
              <Icon as={BsBoxArrowUpRight} boxSize={5} />
            </Box>
            <Box display={"flex"} gap={2} cursor={"pointer"}>
              <Text>Xem Hợp Đồng</Text>
              <Icon as={AiFillCodepenCircle} boxSize={5} />
            </Box>
          </SimpleGrid>
          <Box
            w={"100%"}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"start"}
            justifyContent={"center"}
            gap={15}
          >
            {unstakeNFT.length == 0 && stakeNFT.length == 0 ? (
              <AddLiquidityCard />
            ) : (
              <></>
            )}
            {unstakeNFT.length > 0 ? (
              unstakeNFT.map((item, key) => (
                <StakingCard
                  key={key}
                  tokenId={item}
                  LINKPrice={LINKPrice}
                  ETHPrice={ETHPrice}
                />
              ))
            ) : (
              <></>
            )}
            {stakeNFT.length > 0 ? (
              stakeNFT.map((item, key) => (
                <HarvestCard
                  tokenId={item}
                  key={key}
                  LINKPrice={LINKPrice}
                  ETHPrice={ETHPrice}
                />
              ))
            ) : (
              <></>
            )}
            {stakeNFT.length > 1 ? (
              <Web3Button
                contractAddress={Sepolia.StakingPool}
                contractAbi={StackingABI.abi}
                action={handleHarvestAll}
                className="button_staking-harvest_all"
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
                            Thu Hoạch Tất Cả Thành Công!
                          </Text>
                        </Center>
                      </Box>
                    ),
                  });
                  window.location.reload();
                }}
                onError={(err) => console.log(err)} // Logic to execute when clicked
              >
                Thu Hoạch Hết Tất Cả
              </Web3Button>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      )}
      <AddLiquidityModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default FarmCard;
