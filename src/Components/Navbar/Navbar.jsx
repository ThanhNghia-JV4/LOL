import {
  Box,
  Flex,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { ConnectWallet } from "@thirdweb-dev/react";
import { BsThreeDots } from "react-icons/bs";
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
            TVNSwap
          </Heading>
          <SimpleGrid
            columns={6}
            spacing={10}
            ml={"24px"}
            textAlign="center"
            p={6}
          >
            <Menu>
              <MenuButton
                cursor={"pointer"}
                _hover={{
                  color: "teal.500",
                  fontWeight: "bold",
                }}
              >
                Trade
              </MenuButton>
              <MenuList>
                <MenuItem>Swap</MenuItem>
                <MenuItem>
                  <NavLink to={"trade/liquidity"}>Liquidity</NavLink>
                </MenuItem>
                <MenuItem>Perpetual</MenuItem>
                <MenuItem>Bridge</MenuItem>
                <MenuItem>Limit(V2)</MenuItem>
                <MenuItem>Buy crypto</MenuItem>
              </MenuList>
            </Menu>

            <Menu
              cursor={"pointer"}
              _hover={{
                color: "teal.500",
                fontWeight: "bold",
              }}
            >
              <MenuButton>Earn</MenuButton>
              <MenuList>
                <MenuItem>
                  <NavLink to={"farms"}>Farms</NavLink>
                </MenuItem>
                <MenuItem>
                  <NavLink to={"pools"}>Pools</NavLink>
                </MenuItem>
                <MenuItem>Liquidity Staking</MenuItem>
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                cursor={"pointer"}
                _hover={{
                  color: "teal.500",
                  fontWeight: "bold",
                }}
              >
                Win
              </MenuButton>
              <MenuList>
                <MenuItem>Trading Reward</MenuItem>
                <MenuItem>Trading Competition</MenuItem>
                <MenuItem>Prediction(BETA)</MenuItem>
                <MenuItem>Lottery</MenuItem>
                <MenuItem>Limit(V2)</MenuItem>
                <MenuItem>Pottery(BETA)</MenuItem>
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                cursor={"pointer"}
                _hover={{
                  color: "teal.500",
                  fontWeight: "bold",
                }}
              >
                NFT
              </MenuButton>
              <MenuList>
                <MenuItem>Overview</MenuItem>
                <MenuItem>Collections</MenuItem>
                <MenuItem>Activity</MenuItem>
              </MenuList>
            </Menu>

            <Menu>
              <MenuButton
                cursor={"pointer"}
                _hover={{
                  color: "teal.500",
                  fontWeight: "bold",
                }}
              >
                Game
              </MenuButton>
              <MenuList>
                <MenuItem>TVN Protectors</MenuItem>
              </MenuList>
            </Menu>
            <Text
              cursor={"pointer"}
              _hover={{
                color: "teal.500",
                fontWeight: "bold",
              }}
            >
              <Icon as={BsThreeDots} boxSize={5} />
            </Text>
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
