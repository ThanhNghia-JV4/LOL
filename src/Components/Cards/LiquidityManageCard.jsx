import {
  Box,
  Button,
  Checkbox,
  Divider,
  Heading,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import LiquidityPositionCard from "./LiquidityPositionCard";
import StakingABI from "../../Services/ABI/TVNStakingPool.json";
import NFTPositionABI from "../../Services/ABI/TVNNFTPositionManager.json";
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { Sepolia } from "../../Constants";
import { ethers } from "ethers";
import AddLiquidityModal from "../Modal/AddLiquidityModal";

const LiquidityManageCard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [yourAddress, setYourAddress] = useState(0);
  const [unstake, setUnstake] = useState([]);
  const [stake, setStake] = useState([]);

  const { contract: NFTPositionContract } = useContract(
    Sepolia.NFTPos,
    NFTPositionABI.abi
  );

  const { contract: StakingContract } = useContract(
    Sepolia.StakingPool,
    StakingABI.abi
  );

  const address = useAddress();

  const { data: unstakedNFT } = useContractRead(
    NFTPositionContract,
    "getOwnerNFT",
    [`${yourAddress}`]
  );

  const { data: stakedNFT } = useContractRead(
    StakingContract,
    "getOwnedStakingNFT",
    [`${yourAddress}`]
  );

  useEffect(() => {
    if (address != undefined) {
      setYourAddress(address);
    }

    if (unstakedNFT != undefined) {
      if (unstakedNFT.length > 0) {
        let modifierUnstakedNFT = unstakedNFT.map((item) => {
          return {
            tokenId: ethers.utils.formatUnits(item, 0),
            isStaked: false,
          };
        });
        modifierUnstakedNFT = modifierUnstakedNFT.sort(
          (a, b) => a.tokenId - b.tokenId
        );
        setUnstake(modifierUnstakedNFT);
      }
    }

    if (stakedNFT != undefined) {
      if (stakedNFT.length > 0) {
        let modifierStakedNFT = stakedNFT.map((item) => {
          return {
            tokenId: ethers.utils.formatUnits(item, 0),
            isStaked: true,
          };
        });
        modifierStakedNFT = modifierStakedNFT.sort(
          (a, b) => a.tokenId - b.tokenId
        );
        setStake(modifierStakedNFT);
      }
    }
  }, [address, unstakedNFT, stakedNFT]);
  return (
    <>
      <Box p={8}>
        <Heading fontSize={"2xl"} color={"rgb(40,13,95)"}>
          Thanh Khoản Của Bạn
        </Heading>
        <Text my={4} color={"rgb(122,110,170)"}>
          Danh sách các vị thế thanh khoản của bạn
        </Text>
        <Divider orientation="horizontal" />
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          gap={4}
          mt={4}
        >
          <Checkbox fontSize={"2xl"}>Ẩn những vị thế đã đóng</Checkbox>
          <Box
            border={"1px"}
            borderColor={"gray.200"}
            borderRadius={"20px"}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"start"}
            alignItems={"center"}
            gap={4}
            bg={"rgb(238,243,244)"}
            color={"rgb(122,110,170)"}
            fontWeight={"bold"}
            // py={2}
            // px={4}
          >
            <Text
              border={"1px"}
              borderColor={"gray.300"}
              borderRadius={"30px"}
              bg={"rgb(122,110,170)"}
              color={"white"}
              py={2}
              px={4}
            >
              Tất Cả
            </Text>
            <Text px={4}>V3</Text>
            <Text px={4}>StableSwap</Text>
            <Text px={4}>V2</Text>
          </Box>
        </Box>
      </Box>
      <Box
        p={8}
        bg={"rgb(238,238,238)"}
        borderTop={"1px"}
        borderBottom={"1px"}
        borderColor={"gray.300"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        {unstake.length > 0 ? (
          unstake.map((item, key) => (
            <LiquidityPositionCard
              tokenId={item.tokenId}
              isStaked={item.isStaked}
              key={key}
            />
          ))
        ) : (
          <></>
        )}

        {stake.length > 0 ? (
          stake.map((item, key) => (
            <LiquidityPositionCard
              tokenId={item.tokenId}
              isStaked={item.isStaked}
              key={key}
            />
          ))
        ) : (
          <></>
        )}
      </Box>
      <Box p={8}>
        <Button
          w={"100%"}
          p={6}
          color={"white"}
          fontWeight={"bold"}
          bg={"rgb(31,199,212)"}
          _hover={{
            backgroundColor: "rgb(106, 216, 224)",
          }}
          borderRadius={"20px"}
          onClick={onOpen}
        >
          {" "}
          + Thêm Thanh Khoản
        </Button>
        <AddLiquidityModal isOpen={isOpen} onClose={onClose} />
      </Box>
    </>
  );
};

export default LiquidityManageCard;
