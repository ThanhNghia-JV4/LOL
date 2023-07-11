import {
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  Input,
  Select,
  SimpleGrid,
  Switch,
  Text,
} from "@chakra-ui/react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { IoGridOutline } from "react-icons/io5";
import { FaList } from "react-icons/fa";
import FarmCard from "../Components/Cards/FarmCard";
import { NavLink } from "react-router-dom";


const FarmPage = () => {
  return (
    <>
      <Center background={"white"}>
        <SimpleGrid columns={3}>
          <NavLink to={"/farms"}>
            <Text
              py={2}
              borderBottom="4px"
              borderColor="green.500"
              textAlign={"center"}
              cursor={"pointer"}
            >
              Farms
            </Text>
          </NavLink>
          <NavLink to={"/pools"}>
            <Text p={2} textAlign={"center"} cursor={"pointer"}>
              Pools
            </Text>
          </NavLink>
          <Text p={2} textAlign={"center"} cursor={"pointer"}>
            Liquid Staking
          </Text>
        </SimpleGrid>
      </Center>
      <Center
        bg={"rgb(237,245,255)"}
        borderTop={"2px"}
        borderBottom={"1px"}
        borderColor={"gray.200"}
      >
        <Box w="74%" py={4}>
          <Heading as="h1" size="3xl" py={4} color={"rgb(118,69,217)"}>
            Farms
          </Heading>
          <Box>
            <Text
              py={1}
              fontWeight={"bold"}
              color={"rgb(40,13,95)"}
              fontSize={"xl"}
            >
              Đặt Cọc LP Tokens để nhận thưởng
            </Text>
            <Flex py={1} color={"rgb(38,201,214)"}>
              <Text mr={2}>Đấu giá cộng đồng</Text>
              <Icon as={AiOutlineArrowRight} boxSize={5} />
            </Flex>
          </Box>
        </Box>
      </Center>
      <Center>
        <Box
          w="74%"
          px={10}
          py={4}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box
            display={"flex"}
            justifyContent={"start"}
            alignItems={"center"}
            gap={8}
          >
            <Text
              py={2}
              cursor={"pointer"}
              textAlign={"center"}
              fontWeight={"bold"}
            >
              <Icon as={IoGridOutline} boxSize={8} color={"rgb(189,194,196)"} />
            </Text>
            <Text
              py={2}
              cursor={"pointer"}
              textAlign={"center"}
              fontWeight={"bold"}
            >
              <Icon as={FaList} boxSize={8} color={"rgb(85,212,222)"} />
            </Text>
            <Box>
              <Text fontWeight={"bold"} p={1}>
                Lọc Bằng
              </Text>
              <Box pb={8}>
                <SimpleGrid
                  columns={2}
                  // spacing={2}
                  border={"1px"}
                  borderColor={"gray.300"}
                  borderRadius={40}
                  mt="2px"
                  bg={"rgb(238,234,244)"}
                >
                  <Text
                    border={"1px"}
                    borderColor={"gray.300"}
                    borderRadius={40}
                    py={2}
                    px={4}
                    textAlign={"center"}
                    cursor={"pointer"}
                    bg={"rgb(122,110,170)"}
                    color={"white"}
                    fontWeight={"bold"}
                  >
                    Đang Mở
                  </Text>
                  <Text
                    py={2}
                    px={4}
                    cursor={"pointer"}
                    textAlign={"center"}
                    fontWeight={"bold"}
                    color={"rgb(162,152,195"}
                  >
                    Đã Kết Thúc
                  </Text>
                </SimpleGrid>
              </Box>
            </Box>
            <Text
              py={2}
              px={6}
              bg={"rgb(238,234,244)"}
              border={"1px"}
              borderColor={"gray.300"}
              borderRadius={40}
              cursor={"pointer"}
              textAlign={"center"}
              fontWeight={"bold"}
              color={"rgb(162,152,195"}
            >
              Loại Farm
            </Text>
            <Box display={"flex"} gap={4} textAlign={"center"}>
              <Switch size="lg" py={2} />
              <Text py={2}>Đang Đặt Cọc</Text>
            </Box>
          </Box>
          <SimpleGrid columns={2} spacing={10} mt="2px">
            <Box pb={8} w="100%">
              <Text fontWeight={"bold"} py={2} px={6}>
                Sắp Xếp
              </Text>
              <Select
                placeholder="Nóng Nhất"
                border={"1px"}
                borderColor={"gray.300"}
                borderRadius={40}
                mt="5px"
                bg={"rgb(238,234,244)"}
              >
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </Select>
            </Box>
            <Box pb={8} w="100%">
              <Text fontWeight={"bold"} py={2} px={10}>
                Tìm Kiếm
              </Text>
              <Box
                border={"1px"}
                borderColor={"gray.300"}
                borderRadius={40}
                mt="5px"
                bg={"rgb(238,234,244)"}
              >
                <Input
                  placeholder=" Tìm kiếm Farms"
                  size="md"
                  variant="unstyled"
                  py={2}
                  px={6}
                  cursor={"pointer"}
                  textAlign={"center"}
                  fontWeight={"bold"}
                  color={"rgb(162,152,195"}
                />
              </Box>
            </Box>
          </SimpleGrid>
        </Box>
      </Center>
      <Center>
        <Box
          borderRadius={30}
          border="2px"
          borderColor={"gray.300"}
          w="80%"
          boxShadow="base"
          bg="white"
          mb={40}
        >
          <FarmCard isEnd={false} />
          <FarmCard isEnd={true} />
        </Box>
      </Center>
    </>
  );
};

export default FarmPage;
