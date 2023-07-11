/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Box, Button, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import {
  AiFillCodepenCircle,
  AiOutlineCalculator,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { Token } from "../../Constants";
import tokenContractABI from "../../Services/ABI/ERC20.json";
import { ethers } from "ethers";

const SyrupCard = ({ isEnd }) => {
  const [infoCard, setInfoCard] = useState(false);
  const [allowance, setAllowance] = useState(0);
  const [balanceOfTVN, setBalanceOfTVN] = useState(0);
  const [yourAddress, setYourAddress] = useState(0);
  
  const { contract: tvnContract } = useContract(
    Token.TVN,
    tokenContractABI.abi
  );

  const address = useAddress();

  const { data: balance } = useContractRead(tvnContract, "balanceOf", [
    `${yourAddress}`,
  ]);

  useEffect(() => {
    if (address != undefined) {
      setYourAddress(address);
    }

    if (balance != undefined) {
      setBalanceOfTVN(ethers.utils.formatUnits(balance, 18));
    }
  }, [address, balance]);

  return (
    <>
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"start"}
        // alignItems={"center"}
        // textAlign={"center"}
        gap={20}
        color={"rgb(40,13,95)"}
        p={10}
        borderBottomRadius={isEnd && !infoCard ? 30 : 0}
        borderBottom={"2px"}
        borderColor={"gray.300"}
        textAlign={"left"}
        w={"100%"}
        // className="glass-effect"
      >
        <Box>
          <Text fontWeight={"bold"} fontSize={"2xl"}>
            Đặt Cọc TVN
          </Text>
          <Text fontSize={"sm"}>Đặt Cọc, Kiếm Tiền - Và Hơn Nữa</Text>
        </Box>
        <Box>
          <Text>TVN Đã Đặt Cọc</Text>
          <Text fontSize={"xl"} fontWeight={"bold"}>
            0.00
          </Text>
          <Text>0 USD</Text>
        </Box>
        <Box>
          <Text>APR Linh Hoạt</Text>
          <Box display={"flex"} gap={1}>
            <Text fontSize={"xl"}>0.87 %</Text>
            <Icon as={AiOutlineCalculator} boxSize={6} />
          </Box>
        </Box>
        <Box>
          <Text>APR Cố Định</Text>
          <Box display={"flex"} gap={1}>
            <Text fontSize={"xl"}>Lên Tới 17.87 %</Text>
            <Icon as={AiOutlineCalculator} boxSize={6} />
          </Box>
        </Box>
        <Box>
          <Text>Tổng Số Lượng Đã Đặt Cọc</Text>
          <Text fontSize={"xl"}>200.000.000 TVN</Text>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"end"}
          alignItems={"center"}
          fontWeight={"bold"}
          fontSize={"lg"}
          color={"rgb(31,199,212)"}
          w={"10%"}
        >
          {infoCard ? (
            <Box
              display={"flex"}
              gap={2}
              alignItems={"center"}
              onClick={() => setInfoCard(false)}
              cursor={"pointer"}
            >
              <Text>Ẩn</Text>
              <Icon as={AiOutlineUp} boxSize={6} />
            </Box>
          ) : (
            <Box
              display={"flex"}
              gap={2}
              alignItems={"center"}
              onClick={() => setInfoCard(true)}
              cursor={"pointer"}
            >
              <Text>Hiện</Text>
              <Icon as={AiOutlineDown} boxSize={6} />
            </Box>
          )}
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
          <Box>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              gap={4}
              color={"rgb(40,13,95)"}
            >
              <Text>Tổng Số Đã Được Khóa:</Text>
              <Text>181.000.000 TVN</Text>
            </Box>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              gap={4}
              color={"rgb(40,13,95)"}
            >
              <Text>Thời gian khóa trung bình:</Text>
              <Text>42 tuần</Text>
            </Box>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              gap={4}
              color={"rgb(40,13,95)"}
            >
              <Text>Phí:</Text>
              <Text>0 ~ 2%</Text>
            </Box>
            <Box display={"flex"} gap={2} color={"rgb(31,199,212)"}>
              <Text>Xem Thông Tin Token</Text>
              <Icon as={BsBoxArrowUpRight} boxSize={5} />
            </Box>
            <Box display={"flex"} gap={2} color={"rgb(31,199,212)"}>
              <Text>Xem Hướng Dẫn</Text>
              <Icon as={BsBoxArrowUpRight} boxSize={5} />
            </Box>
            <Box display={"flex"} gap={2} color={"rgb(31,199,212)"}>
              <Text>Xem Hợp Đồng</Text>
              <Icon as={AiFillCodepenCircle} boxSize={5} />
            </Box>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"center"}
            alignItems={"center"}
            w={"70%"}
            p={4}
          >
            <SimpleGrid columns={2} spacing={15}>
              <Box
                p={8}
                border={"2px"}
                borderColor={"gray.300"}
                borderRadius={"20px"}
              >
                <Text
                  mb={4}
                  fontWeight={"bold"}
                  fontSize={"xl"}
                  color={"rgb(118,69,217)"}
                >
                  LỢI NHUẬN TVN GẦN ĐÂY
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize={"4xl"} fontWeight={"bold"}>
                      0.00
                    </Text>
                    <Text>0 USD</Text>
                  </Box>
                  <Box>
                    <Text>0.1% phí rút nếu như rút trước 72 giờ</Text>
                  </Box>
                </SimpleGrid>
              </Box>
              {allowance < balanceOfTVN ? (
                <Box
                  p={8}
                  border={"2px"}
                  borderColor={"gray.300"}
                  borderRadius={"20px"}
                >
                  <Text
                    mb={4}
                    fontWeight={"bold"}
                    fontSize={"xl"}
                    color={"rgb(118,69,217)"}
                  >
                    CẤP QUYỀN CHO POOL
                  </Text>
                  <Button
                    w={"100%"}
                    p={6}
                    border={"2px"}
                    borderRadius={"20px"}
                    borderColor={"rgb(31,199,212)"}
                    color={"rgb(31,199,212)"}
                  >
                    Cấp Quyền
                  </Button>
                </Box>
              ) : (
                <Box
                  p={8}
                  border={"2px"}
                  borderColor={"gray.300"}
                  borderRadius={"20px"}
                >
                  <Text
                    mb={4}
                    fontWeight={"bold"}
                    fontSize={"xl"}
                    color={"rgb(118,69,217)"}
                  >
                    ĐẶT CỌC TVN
                  </Text>
                  <SimpleGrid columns={2} spacing={2}>
                    <Button
                      p={8}
                      borderRadius={"15px"}
                      bg={"rgb(31,199,212)"}
                      color={"white"}
                      _hover={{
                        bg: "rgb(106, 216, 224)",
                      }}
                    >
                      Linh Hoạt
                    </Button>
                    <Button
                      p={8}
                      borderRadius={"15px"}
                      bg={"rgb(31,199,212)"}
                      color={"white"}
                      _hover={{
                        bg: "rgb(106, 216, 224)",
                      }}
                    >
                      Cố Định
                    </Button>
                  </SimpleGrid>
                  <Text mt={4} cursor={"pointer"}>
                    Có gì khác biệt?
                  </Text>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SyrupCard;