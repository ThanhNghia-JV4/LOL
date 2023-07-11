/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Box, Button, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

const PriceRangeCard = ({ price, isLower, setUpperTick, setLowerTick }) => {
  const [priceDisplay, setPriceDisplay] = useState(0);

  useEffect(() => {
    if (price != undefined) {
      let modifyPrice = 0;
      if (isLower) {
        modifyPrice = +price / 2;
        setLowerTick(modifyPrice.toFixed(6));
      } else {
        modifyPrice = +price * 2;
        setUpperTick(modifyPrice.toFixed(6));
      }

      setPriceDisplay(modifyPrice.toFixed(6));
    }
  }, [price]);

  const handleTick = (isPlus) => {
    if (isLower && isPlus) {
      setLowerTick((+priceDisplay + 0.000001).toFixed(6));
    } else if (isLower && !isPlus) {
      setLowerTick((+priceDisplay - 0.000001).toFixed(6));
    } else if (!isLower && isPlus) {
      setUpperTick((+priceDisplay + 0.000001).toFixed(6));
    } else {
      setUpperTick((+priceDisplay - 0.000001).toFixed(6));
    }
  };

  const handlePlus = () => {
    setPriceDisplay((prev) => +prev + 0.000001);
    handleTick(true);
  };

  const handleMinus = () => {
    setPriceDisplay((prev) => +prev - 0.000001);
    handleTick(false);
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      border={"2px"}
      borderColor={"gray.300"}
      borderRadius={"10px"}
      p={6}
    >
      <Text fontSize={"xl"}>Giá Tối Thiểu</Text>
      <Text fontSize={"3xl"} fontWeight={"bold"}>
        {(+priceDisplay).toFixed(6)}
      </Text>
      <SimpleGrid columns={2} spacing={4} mt={2}>
        <Button
          bg={"rgb(31, 199, 212)"}
          color={"white"}
          borderRadius={"30px"}
          p={1}
          onClick={handleMinus}
          _hover={{
            bg: "rgb(106, 216, 224)",
          }}
        >
          <Icon as={FaMinus} boxSize={2} />
        </Button>
        <Button
          bg={"rgb(31, 199, 212)"}
          color={"white"}
          borderRadius={"30px"}
          p={1}
          onClick={handlePlus}
          _hover={{
            bg: "rgb(106, 216, 224)",
          }}
        >
          <Icon as={FaPlus} boxSize={2} />
        </Button>
      </SimpleGrid>
    </Box>
  );
};

export default PriceRangeCard;
