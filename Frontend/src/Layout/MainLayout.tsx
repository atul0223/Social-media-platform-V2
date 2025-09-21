import NavBar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden">
        <div className="h-screen overflow-hidden w-fit">
          <NavBar />
        </div>

        <div className="w-full h-full overflow-y-auto">
          <SearchBar/>
          <Outlet />
        </div>
      </div>
    </>
  );
};
