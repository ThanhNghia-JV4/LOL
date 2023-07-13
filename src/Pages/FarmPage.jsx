import {
  Box,
  Center,
  // Flex,
  Heading,
  // Icon,
  // Input,
  // Select,
  SimpleGrid,
  // Switch,
  Text,
} from "@chakra-ui/react";
// import { AiOutlineArrowRight } from "react-icons/ai";
// import { IoGridOutline } from "react-icons/io5";
// import { FaList } from "react-icons/fa";
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
            {/* <Flex py={1} color={"rgb(38,201,214)"}>
              <Text mr={2}>Đấu giá cộng đồng</Text>
              <Icon as={AiOutlineArrowRight} boxSize={5} />
            </Flex> */}
          </Box>
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
          {/* <FarmCard isEnd={true} /> */}
        </Box>
      </Center>
    </>
  );
};

export default FarmPage;
