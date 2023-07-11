import { Box, Button, Text, useDisclosure } from "@chakra-ui/react";
import AddLiquidityModal from "../Modal/AddLiquidityModal";

const AddLiquidityCard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box
      border={"2px"}
      borderColor={"gray.300"}
      borderRadius={20}
      p={10}
      w={"100%"}
    >
      <Text mb={2} fontWeight={"bold"} color={"rgb(40,13,95)"}>
        Không Có Vị Thế Nào
      </Text>
      <Button
        bg={"rgb(31,199,212)"}
        _hover={{ bg: "rgb(106,216,224)" }}
        variant="solid"
        w={"100%"}
        color={"white"}
        p={6}
        borderRadius={15}
        onClick={onOpen}
      >
        Thêm Thanh Khoản
      </Button>
      <AddLiquidityModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default AddLiquidityCard;
