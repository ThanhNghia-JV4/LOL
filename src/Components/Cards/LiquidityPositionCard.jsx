/* eslint-disable react/prop-types */
import { Box, Heading, Icon, Text } from "@chakra-ui/react";
import { BsArrowLeftRight } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import NFTPositionABI from "../../Services/ABI/TVNNFTPositionManager.json";
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { Sepolia } from "../../Constants";

const LiquidityPositionCard = ({ tokenId, isStaked }) => {
  const [position, setPosition] = useState({}); 

  const { contract: NFTPositionContract } = useContract(
    Sepolia.NFTPos,
    NFTPositionABI.abi
  );

  const { data: positionInfo } = useContractRead(
    NFTPositionContract,
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
        lowerPrice: formatSqrtPriceX96(positionInfo.lowerTick),
        upperPrice: formatSqrtPriceX96(positionInfo.upperTick),
      };
      setPosition(modifyPosition);
    }
    
  }, [positionInfo]);

  return (
    <Box
      p={4}
      w={"100%"}
      bg={"white"}
      border={"1px"}
      borderColor={"gray.300"}
      borderRadius={"30px"}
      mb={4}
    >
      <NavLink to={tokenId}>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"start"}
          alignItems={"center"}
          gap={2}
        >
          <Heading fontSize={"xl"} color={"rgb(40,13,95)"}>
            LINK-ETH LP
          </Heading>
          <Text fontSize={"xl"}>(#{tokenId})</Text>
          <Text
            border={"1px"}
            borderColor={"rgb(122,154,208)"}
            borderRadius={"20px"}
            color={"rgb(122,154,208)"}
            py={1}
            px={4}
            fontSize={"xl"}
          >
            0.3%
          </Text>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={2}
        >
          <Box display={"flex"} gap={2}>
            <Text color={"rgb(122,110,170)"}>
              Min {(+position?.lowerPrice).toFixed(6)} / Max{" "}
              {(+position?.upperPrice).toFixed(6)} ETH Per LINK
            </Text>
            <Icon as={BsArrowLeftRight} color={"rgb(31,199,212)"} boxSize={5} />
          </Box>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"end"}
            alignItems={"center"}
            gap={4}
          >
            {isStaked ? (
              <Text
                p={2}
                border={"2px"}
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
              p={2}
              border={"2px"}
              bg={"rgb(53,204,169)"}
              borderRadius={"20px"}
              color={"white"}
            >
              Hoạt Động
            </Text>
          </Box>
        </Box>
      </NavLink>
    </Box>
  );
};

export default LiquidityPositionCard;
