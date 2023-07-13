import {
  Box,
  Center,
  Heading,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";

import SyrupCard from "../Components/Cards/SyrupCard";
import { NavLink } from "react-router-dom";


const SyrupPoolPage = () => {
  return (
    <>
      <Center background={"white"}>
        <SimpleGrid columns={3}>
          <NavLink to={"/farms"}>
            <Text p={2} textAlign={"center"} cursor={"pointer"}>
              Farms
            </Text>
          </NavLink>
          <NavLink to={"/pools"}>
            <Text
              py={2}
              borderBottom="4px"
              borderColor="green.500"
              textAlign={"center"}
              cursor={"pointer"}
            >
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
          <Heading as="h1" size="3xl" py={6} color={"rgb(118,69,217)"}>
            Syrup Pools
          </Heading>
          <Box>
            <Text fontWeight={"bold"} color={"rgb(40,13,95)"} fontSize={"xl"}>
              Chỉ cần đặt cọc Token để kiếm tiền.
            </Text>
            <Text fontWeight={"bold"} color={"rgb(40,13,95)"} fontSize={"xl"}>
              APR Cao, Rủi Ro Thấp.
            </Text>
          </Box>
        </Box>
      </Center>
      {/* <Box className="glass-effect"> */}
      <Box
        w={"100%"}
        // h={"100vh"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"start"}
        // color={"white"}
        // bg={"rgba(0,0,0,0.5)"}
      >
        <Box
          borderRadius={30}
          border="2px"
          borderColor={"gray.300"}
          w="80%"
          boxShadow="base"
          bg="white"
          mb={40}
        >
          <SyrupCard isEnd={false} />
          {/* <SyrupCard isEnd={true} /> */}
        </Box>
      </Box>
      {/* </Box> */}
    </>
  );
};

export default SyrupPoolPage;
