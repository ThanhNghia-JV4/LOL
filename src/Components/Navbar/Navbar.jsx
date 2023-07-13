import {
  Box,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spacer,
} from "@chakra-ui/react";
import { ConnectWallet } from "@thirdweb-dev/react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <Box
      px={"25px"}
      py={"8px"}
      mb={"10px"}
      borderBottom="2px"
      borderColor="gray.200"
    >
      <Flex>
        <Box display={"flex"} justifyContent={"start"} alignContent={"center"}>
          <Heading as="h4" pt={"9px"}>
            BAOCAOSwap
          </Heading>
          <SimpleGrid
            columns={6}
            spacing={10}
            ml={"24px"}
            textAlign="center"
            p={6}
          >


            <Menu
              cursor={"pointer"}
              _hover={{
                color: "teal.500",
                fontWeight: "bold",
              }}
            >
              <MenuItem>
              <NavLink to={"#"}>Home</NavLink>
              </MenuItem>
              <MenuButton>Earn</MenuButton>
              <MenuList>
                <MenuItem>
                  <NavLink to={"farms"}>Farms</NavLink>
                </MenuItem>
                <MenuItem>
                  <NavLink to={"pools"}>Pools</NavLink>
                </MenuItem>
               
              </MenuList>
            </Menu>
          </SimpleGrid>
        </Box>
        <Spacer />
        <ConnectWallet
          theme="light"
          btnTitle="Kết Nối Ví"
          className="button__connect-wallet"
          modalTitle="Lựa Chọn Mạng"
        />
      </Flex>
    </Box>
  );
};

export default Navbar;
