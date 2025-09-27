import NavBar from "@/components/NavBar";
import Notifications from "@/components/Notifications";
import SearchBar from "@/components/SearchBar";
import UserContext from "@/context/UserContext";
import { useContext } from "react";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  const { isNotiOpen }: any = useContext(UserContext);
  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden">
        <div className="h-screen overflow-hidden w-fit">
          <NavBar />
        </div>
            {isNotiOpen && (
            <Notifications/>
          )}
        <div className="w-full h-full overflow-y-auto">
          <SearchBar/>
          <Outlet />
        </div>
      </div>
    </>
  );
};
