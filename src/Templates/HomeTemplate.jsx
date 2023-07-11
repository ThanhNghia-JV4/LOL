/* eslint-disable no-unused-vars */
import HeaderHome from "../Components/Navbar/Navbar";
import { Outlet } from "react-router-dom";

const HomeTemplate = (props) => {
	return (
		<div>
			<HeaderHome />
			<Outlet />
		</div>
	);
};

export default HomeTemplate;
