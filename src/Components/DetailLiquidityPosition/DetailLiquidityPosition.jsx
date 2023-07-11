/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Center,
  Heading,
  Icon,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  AiFillCheckCircle,
  AiOutlineCalculator,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { useParams } from "react-router-dom";
import NFTPositionABI from "../../Services/ABI/TVNNFTPositionManager.json";
import {
  Web3Button,
  useAddress,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react";
import { Sepolia } from "../../Constants";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import AddLiquidityModal from "../Modal/AddLiquidityModal";
import LmPoolABI from "../../Services/ABI/LmPoolV3withReserver.json";
import StakingABI from "../../Services/ABI/TVNStakingPool.json";
import OracleABI from "../../Services/ABI/Oracle.json";
import { useNavigate } from "react-router-dom";

const DetailLiquidityPosition = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [yourAddress, setYourAddress] = useState(0);
  const [unstakeNFT, setUnstakedNFT] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const params = useParams();
  const [positionInfo, setPositionInfo] = useState({});
  const [LINKPrice, setLINKPrice] = useState(0);
  const [ETHPrice, setETHPrice] = useState(0);

  const address = useAddress();

  const { contract: NFTPositionContract } = useContract(
    Sepolia.NFTPos,
    NFTPositionABI.abi
  );

  const { contract: StakingContract } = useContract(
    Sepolia.StakingPool,
    StakingABI.abi
  );

  const { contract: OracleContract } = useContract(
    Sepolia.Oracle,
    OracleABI.abi
  );

  const { contract: LmPoolContract } = useContract(
    Sepolia.LmPool,
    LmPoolABI.abi
  );

  const { data: position } = useContractRead(NFTPositionContract, "positions", [
    `${params.tokenId}`,
  ]);

  const { data: ownerNFT } = useContractRead(
    NFTPositionContract,
    "getOwnerNFT",
    [`${yourAddress}`]
  );

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

  // const

  const formatSqrtPriceX96 = (sqrtPrice) => {
    let price = sqrtPrice / 2 ** 96;
    price = price ** 2 / 1e18;
    return price.toFixed(6);
  };

  useEffect(() => {
    if (address != undefined) {
      setYourAddress(address);
    }

    if (position != undefined) {
      let modifierPosition = {
        amount0: ethers.utils.formatUnits(position.amount0, 18),
        amount1: ethers.utils.formatUnits(position.amount1, 18),
        shares: ethers.utils.formatUnits(position.shares, 0),
        lowerPrice: formatSqrtPriceX96(positionInfo.lowerTick),
        upperPrice: formatSqrtPriceX96(positionInfo.upperTick),
        deltaLiquidity: ethers.utils.formatUnits(position.deltaLiquidity, 0),
      };
      setPositionInfo(modifierPosition);
    }

    if (ownerNFT != undefined) {
      if (ownerNFT.length > 0) {
        let modifierOwnerNFT = ownerNFT.map((item) =>
          ethers.utils.formatUnits(item, 0)
        );
        setUnstakedNFT(modifierOwnerNFT);
      }
    }

    if (linkusd != undefined) {
      setLINKPrice(ethers.utils.formatUnits(linkusd, 8));
    }

    if (ethusd != undefined) {
      setETHPrice(ethers.utils.formatUnits(ethusd, 8));
    }
  }, [position, address, ownerNFT, params.tokenId, linkusd, ethusd]);

  const handleRemoveLiquidity = async (contract) => {
    const index = unstakeNFT.findIndex((item) => item == params.tokenId);

    if (index < 0) {
      await StakingContract.call("unstake", [`${params.tokenId}`]);
    }

    const allowance = await NFTPositionContract.call("isApprovalForAll", [
      `${yourAddress}`,
      Sepolia.LmPool,
    ]);

    if (!allowance) {
      await NFTPositionContract.call("setApprovalForAll", [
        Sepolia.LmPool,
        true,
      ]);
    }

    await contract.call("removeLiquidity", [`${params.tokenId}`]);
  };

  return (
    <>
      <Box
        borderBottom={"2px"}
        borderColor={"gray.300"}
        p={8}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"start"}
        alignItems={"center"}
        gap={"2"}
      >
        <Box w={"50%"}>
          <Box display={"flex"} gap={4} alignItems={"center"}>
            <Heading fontSize={"2xl"}>LINK-ETH</Heading>
            {unstakeNFT.findIndex((item) => item == params.tokenId) < 0 ? (
              <Text
                py={2}
                px={4}
                border={"1px"}
                borderColor={"rgb(237,213,175)"}
                borderRadius={"20px"}
                color={"rgb(237,213,175)"}
              >
                Đang Canh Tác
              </Text>
            ) : (
              <></>
            )}
            <Text
              py={2}
              px={4}
              border={"1px"}
              bg={"rgb(53,204,169)"}
              borderRadius={"20px"}
              color={"white"}
            >
              Hoạt động
            </Text>
          </Box>
          <Text>V3 LP #{params.tokenId} / 0.5% fee tier</Text>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"end"}
          w="50%"
          gap={2}
        >
          <Button
            bg={"rgb(30,201,215)"}
            color={"white"}
            p={6}
            borderRadius={"10px"}
            _hover={{
              bg: "rgb(106, 216, 224)",
            }}
            onClick={onOpen}
          >
            Thêm Vị Thế
          </Button>
          <Web3Button
            contractAddress={Sepolia.LmPool}
            contractAbi={LmPoolABI.abi}
            action={handleRemoveLiquidity}
            className="button_remove-liquidity"
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
                        Bỏ Vị Thế Thành Công!
                      </Text>
                    </Center>
                  </Box>
                ),
              });
              navigate("/trade/liquidity");
              window.location.reload();
            }} // Logic to execute when clicked
          >
            Bỏ Vị Thế
          </Web3Button>
        </Box>
      </Box>
      <Box
        p={8}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"start"}
        gap={4}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          w="62%"
        >
          <Text>Thanh Khoản</Text>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Text>APR</Text>
            <Text ml="82px">Phí Chưa Thu</Text>
          </Box>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          w={"100%"}
        >
          <Text>
            ${" "}
            {(
              +positionInfo?.amount0 * LINKPrice +
              +positionInfo?.amount1 * ETHPrice
            ).toFixed(2)}
          </Text>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"start"}
            alignItems={"center"}
          >
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"start"}
              alignItems={"center"}
            >
              <Text>0%</Text>
              <Icon as={AiOutlineCalculator} />
              <Icon as={AiOutlineQuestionCircle} />
            </Box>
            <Text ml={"60px"}>$ 0</Text>
          </Box>
          <Button
            _hover={{
              bg: "rgb(106, 216, 224)",
            }}
            py={2}
            px={6}
            bg={"rgb(32,196,220)"}
            borderRadius={"20px"}
            color={"white"}
          >
            Thu Phí
          </Button>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"start"}
          alignItems={"center"}
          w={"100%"}
          gap={8}
        >
          <Box
            w="50%"
            border={"1px"}
            borderColor={"gray.300"}
            bg={"rgb(250,249,250)"}
            p={4}
            borderRadius={"20px"}
          >
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Text>LINK</Text>
              <Text mr={"50px"}>{positionInfo?.amount0}</Text>
            </Box>
            <Text display={"flex"} justifyContent={"end"} mr={"20px"}>
              ~ {(+positionInfo?.amount0 * LINKPrice).toFixed(2)} usd
            </Text>
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Text>ETH</Text>
              <Text mr={"50px"}>{(+positionInfo?.amount1).toFixed(6)}</Text>
            </Box>
            <Text display={"flex"} justifyContent={"end"} mr={"20px"}>
              ~ {(+positionInfo?.amount1 * ETHPrice).toFixed(2)} usd
            </Text>
          </Box>
          <Box
            w={"50%"}
            border={"1px"}
            borderColor={"gray.300"}
            bg={"rgb(250,249,250)"}
            borderRadius={"20px"}
            p={4}
          >
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Text>LINK</Text>
              <Text mr={"30px"}>0</Text>
            </Box>
            <Text display={"flex"} justifyContent={"end"}>
              ~ 0 usd
            </Text>
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Text>ETH</Text>
              <Text mr={"30px"}>0</Text>
            </Box>
            <Text display={"flex"} justifyContent={"end"}>
              ~ 0 usd
            </Text>
          </Box>
        </Box>
      </Box>
      <AddLiquidityModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default DetailLiquidityPosition;
