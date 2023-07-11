/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  Box,
  Center,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import LmPoolV3ABI from "../../Services/ABI/LmPoolV3withReserver.json";
import tokenAddABI from "../../Services/ABI/ERC20.json";
import oracleABI from "../../Services/ABI/Oracle.json";
import { Sepolia, Token } from "../../Constants";
import {
  Web3Button,
  useAddress,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { AiFillCheckCircle } from "react-icons/ai";
import PriceRangeCard from "../Cards/PriceRangeCard/PriceRangeCard";

const AddLiquidityModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [fee, setFee] = useState(0);
  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [balanceA, setBalanceA] = useState(0);
  const [balanceB, setBalanceB] = useState(0);
  const [yourAddress, setYourAddress] = useState(0);
  const [LINKPrice, setLINKPrice] = useState(0);
  const [ETHPrice, setETHPrice] = useState(0);
  const [LINKETHPrice, setLINKETHPrice] = useState(0);
  const [upperTick, setUpperTick] = useState(0);
  const [lowerTick, setLowerTick] = useState(0);

  const { contract: LmPoolContract } = useContract(
    Sepolia.LmPool,
    LmPoolV3ABI.abi
  );

  const { contract: tokenAContract } = useContract(Token.LINK, tokenAddABI.abi);

  const { contract: tokenBContract } = useContract(Token.ETH, tokenAddABI.abi);

  const { contract: oracleContract } = useContract(
    Sepolia.Oracle,
    oracleABI.abi
  );

  const address = useAddress();

  const { data: linkusd } = useContractRead(oracleContract, "getLINKUSDPrice");

  const { data: ethusd } = useContractRead(oracleContract, "getETHUSDPrice");

  const { data: linketh } = useContractRead(oracleContract, "getLINKETHPrice");

  const { data: balanceOfTokenA } = useContractRead(
    tokenAContract,
    "balanceOf",
    [`${yourAddress}`]
  );

  const { data: balanceOfTokenB } = useContractRead(
    tokenBContract,
    "balanceOf",
    [`${yourAddress}`]
  );

  const { data: feeData } = useContractRead(LmPoolContract, "fee");

  useEffect(() => {
    if (address != undefined) {
      setYourAddress(address);
    }

    if (feeData != undefined) {
      setFee(ethers.utils.formatUnits(feeData, 1));
    }

    if (balanceOfTokenA != undefined) {
      setBalanceA(ethers.utils.formatUnits(balanceOfTokenA, 18));
    }

    if (balanceOfTokenB != undefined) {
      setBalanceB(ethers.utils.formatUnits(balanceOfTokenB, 18));
    }

    if (linkusd != undefined) {
      setLINKPrice(ethers.utils.formatUnits(linkusd, 8));
    }

    if (ethusd != undefined) {
      setETHPrice(ethers.utils.formatUnits(ethusd, 8));
    }

    if (linketh != undefined) {
      let price = ethers.utils.formatUnits(linketh, 18);
      setLINKETHPrice(price);
    }
  }, [
    feeData,
    balanceOfTokenA,
    balanceOfTokenB,
    address,
    linkusd,
    ethusd,
    linketh,
  ]);

  useEffect(() => {
    const fectAmount1 = async () => {
      let amount = await LmPoolContract.call("_quoteForAmount0", [
        `${amount0}`,
        `${+upperTick * 1e18}`,
        `${+lowerTick * 1e18}`,
      ]);
      amount = ethers.utils.formatUnits(amount, 36);
      setAmount1(amount.slice(0, 8));
    };
    if (amount0 != 0) {
      fectAmount1();
    }
  }, [upperTick, lowerTick, amount0]);

  // const addLiquidityRef = useRef({ amount0: "", amount1: "" });

  const handleChange = (e) => {
    const { value } = e.target;
    setAmount0(+value * 1e18);
  };

  const addLiquidity = async (contract) => {
    if (+balanceA < amount0 / 1e18) {
      window.alert(`Bạn Không đủ TVA để tiến hành Thêm Thanh Khoản`);
      onClose();
      return;
    }

    if (+balanceB < +amount1) {
      window.alert(`Bạn Không đủ TVB để tiến hành Thêm Thanh Khoản`);
      onClose();
      return;
    }

    let allowanceA = await tokenAContract.call("allowance", [
      yourAddress,
      Sepolia.LmPool,
    ]);

    allowanceA = ethers.utils.formatUnits(allowanceA, 18);

    let allowanceB = await tokenBContract.call("allowance", [
      yourAddress,
      Sepolia.LmPool,
    ]);

    allowanceB = ethers.utils.formatUnits(allowanceB, 18);

    if (+allowanceA < amount0 / 1e18) {
      await tokenAContract.call("approve", [
        Sepolia.LmPool,
        ethers.utils.parseUnits(balanceA, 18).toString(),
      ]);
    }

    if (+allowanceB < +amount1) {
      await tokenBContract.call("approve", [
        Sepolia.LmPool,
        ethers.utils.parseUnits(balanceA, 18).toString(),
      ]);
    }

    await contract.call("addLiquidity", [
      `${amount0}`,
      `${+amount1 * 1e18}`,
      `${+upperTick * 1e18}`,
      `${+lowerTick * 1e18}`,
    ]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"4xl"}>
      <ModalOverlay />
      <ModalContent fontWeight={"bold"}>
        <ModalHeader
          borderBottom={"2px"}
          borderColor={"gray.300"}
          fontSize={"3xl"}
          fontWeight={"bold"}
          onClick={() => {
            console.log("upperTick", +upperTick * 1e18);
            console.log("lowerTick", +lowerTick * 1e18);
          }}
        >
          Thêm Thanh Khoản
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={10}>
          <SimpleGrid columns={2} spacing={20}>
            <Box>
              <Text fontSize={"xl"}>Chọn Cặp Tiền</Text>
              <Box
                display={"flex"}
                justifyContent={"center"}
                gap={4}
                alignItems={"center"}
                mb={2}
                mt={4}
              >
                <Select
                  placeholder="Chọn Token0"
                  border={"2px"}
                  borderColor={"gray.400"}
                  bg={"rgb(238,234,244)"}
                  defaultValue={"LINK"}
                >
                  <option value="LINK">LINK</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                </Select>
                <Text>+</Text>
                <Select
                  placeholder="Chọn Token1"
                  border={"2px"}
                  borderColor={"gray.400"}
                  bg={"rgb(238,234,244)"}
                  defaultValue={"ETH"}
                >
                  <option value="ETH">ETH</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                </Select>
              </Box>
              <Select
                placeholder="Chọn Phiên Bản"
                border={"2px"}
                borderColor={"gray.400"}
                bg={"rgb(238,234,244)"}
                defaultValue={"V3 LP"}
              >
                <option value="V3 LP">V3 LP - {fee} % phí</option>
                <option value="V2 LP">V2 LP - {fee} % phí</option>
              </Select>
              <Text my={4} fontSize={"xl"}>
                Số Lượng Cung Cấp
              </Text>
              <Box
                display="flex"
                justifyContent={"space-between"}
                alignItems={"center"}
                mb={2}
              >
                <Text>LINK</Text>
                <Text>Tài Khoản: {(+balanceA).toFixed(6)}</Text>
              </Box>
              <Box
                border={"2px"}
                borderRadius={"10px"}
                borderColor={"gray.400"}
                bg={"rgb(238,234,244)"}
                textAlign={"right"}
                p={4}
              >
                <Input
                  name="amount0"
                  id="amount0"
                  type="number"
                  textAlign={"right"}
                  fontSize={"xl"}
                  variant="unstyled"
                  min={0}
                  step={0.000000001}
                  onChange={handleChange}
                />
                <Text>~ {((+amount0 / 1e18) * LINKPrice).toFixed(3)} USD</Text>
              </Box>
              <Box
                display="flex"
                justifyContent={"space-between"}
                alignItems={"center"}
                my={2}
              >
                <Text>ETH</Text>
                <Text>Tài Khoản: {(+balanceB).toFixed(6)}</Text>
              </Box>
              <Box
                textAlign={"right"}
                p={4}
                border={"2px"}
                borderColor={"gray.400"}
                bg={"rgb(238,234,244)"}
                borderRadius={"10px"}
              >
                <Input
                  name="amount1"
                  id="amount1"
                  type="number"
                  min={0}
                  step={0.000000001}
                  textAlign={"right"}
                  fontSize={"xl"}
                  variant="unstyled"
                  readOnly
                  value={(+amount1).toFixed(6)}
                />
                <Text>~ {(+amount1 * ETHPrice).toFixed(3)} usd</Text>
              </Box>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"space-between"}
              alignItems={"start"}
            >
              <Text fontSize={"xl"}>Đặt Phạm Vi Giá</Text>
              <Box
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Text fontSize={"xl"}>
                  Giá Hiện Tại: {(+LINKETHPrice).toFixed(6)} LINK / ETH
                </Text>
                <SimpleGrid columns={2} spacing={4} mt={4}>
                  <PriceRangeCard
                    price={LINKETHPrice}
                    isLower={true}
                    setLowerTick={setLowerTick}
                    setUpperTick={setUpperTick}
                  />
                  <PriceRangeCard
                    price={LINKETHPrice}
                    isLower={false}
                    setLowerTick={setLowerTick}
                    setUpperTick={setUpperTick}
                  />
                </SimpleGrid>
              </Box>
              <Web3Button
                contractAddress={Sepolia.LmPool}
                contractAbi={LmPoolV3ABI.abi}
                action={addLiquidity}
                className="button_add-liquidity"
                onSuccess={() => {
                  onClose();
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
                        <Center p={6} w={"100%"} bg="rgb(31, 199, 212)">
                          <Text fontSize={"md"} textAlign={"center"}>
                            Thêm Vị Thế Thành Công!
                          </Text>
                        </Center>
                      </Box>
                    ),
                  });
                }}
                onError={(err) => {
                  console.log("err:", err);
                  onClose();
                }}
              >
                Thêm Thanh Khoản
              </Web3Button>
            </Box>
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddLiquidityModal;
