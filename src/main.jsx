import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'kanit', sans-serif`,
    body: `'kanit', sans-serif`,
  },
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThirdwebProvider activeChain={Sepolia}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </ThirdwebProvider>
  </React.StrictMode>
);