/* eslint-disable no-unused-vars */
import "./App.css";
import LiquidityManageCard from "./Components/Cards/LiquidityManageCard";
import DetailLiquidityPosition from "./Components/DetailLiquidityPosition/DetailLiquidityPosition";
import FarmPage from "./Pages/FarmPage";
import SyrupPoolPage from "./Pages/SyrupPoolPage";
import TradePageTemplate from "./Templates/TradePageTemplate";
import HomeTemplate from "./Templates/HomeTemplate";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Navbar from "./Components/Navbar/Navbar";
// import Footer from "./Components/Footer/Footer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<HomeTemplate />}>
          <Route path="farms" element={<FarmPage />}></Route>
          <Route path="pools" element={<SyrupPoolPage />}></Route>
          <Route path="trade" element={<TradePageTemplate />}>
            <Route path="liquidity" element={<LiquidityManageCard />}></Route>
            <Route path="liquidity">
              <Route
                path=":tokenId"
                element={<DetailLiquidityPosition />}
              ></Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;