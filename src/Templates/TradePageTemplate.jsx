import { Box, Center, SimpleGrid, Text } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const TradePageTemplate = () => {
  return (
    <>
      <Center background={"white"}>
        <SimpleGrid columns={6}>
          <Text p={2} textAlign={"center"} cursor={"pointer"}>
            Swap
          </Text>
          <Text
            py={2}
            borderBottom="4px"
            borderColor="green.500"
            textAlign={"center"}
            cursor={"pointer"}
          >
            Liquidity
          </Text>
          <Text p={2} textAlign={"center"} cursor={"pointer"}>
            Perpetual
          </Text>
          <Text p={2} textAlign={"center"} cursor={"pointer"}>
            Bridge
          </Text>
          <Text p={2} textAlign={"center"} cursor={"pointer"}>
            Limit(V2)
          </Text>
          <Text p={2} textAlign={"center"} cursor={"pointer"}>
            Buy crypto
          </Text>
        </SimpleGrid>
      </Center>
      <Center
        bg={"rgb(237,245,255)"}
        borderTop={"2px"}
        borderBottom={"1px"}
        borderColor={"gray.200"}
      >
        <Box
          borderRadius={30}
          border="2px"
          borderColor={"gray.300"}
          w="50%"
          boxShadow="base"
          bg="white"
          my={100}
        >
          <Outlet />
        </Box>
      </Center>
    </>
  );
};

export default TradePageTemplate;
