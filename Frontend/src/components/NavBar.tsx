import { Link } from "react-router-dom";
import { IoChatbubbleEllipses, IoHome ,IoNotifications } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useContext } from "react";
import UserContext from "@/context/UserContext";
import { FaSearch } from "react-icons/fa";
export default function NavBar() {
  const { tabOpen, setIsNotiOpen, currentUserDetails }: any =
    useContext(UserContext);

  return (
    <>
      <aside className="hidden sm:flex h-screen w-20  text-neutral-800 sticky top-0 left-0 flex-col pt-10 overflow-hidden border-r-7">
        <nav className="flex flex-col gap-12  items-center">
          <Link to="/homepage" className="rounded  transition">
            <Tooltip>
              <TooltipTrigger>
                <IoHome
                  className={`${
                    tabOpen === "home" ? "text-red-600" : ""
                  } w-8 h-8 cursor-pointer`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <Link to="/homepage/search" className=" rounded  transition">
            <Tooltip>
              <TooltipTrigger>
                <FaSearch
                  className={`${
                    tabOpen === "search" ? "text-red-600" : ""
                  } w-7 h-7 cursor-pointer`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Find</p>
              </TooltipContent>
            </Tooltip>
          </Link>
                 <Link to="/chat" className=" rounded  transition">
          <Tooltip>
            <TooltipTrigger>
              <IoChatbubbleEllipses
                   className={`${
                    tabOpen === "chat" ? "text-red-600" : ""
                  } w-8.5 h-8.5 cursor-pointer`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Messages</p>
            </TooltipContent>
          </Tooltip>
        </Link>
          <Link to="/new-post" className="rounded  transition">
            <Tooltip>
              <TooltipTrigger>
                <CiCirclePlus
                  className={`${
                    tabOpen === "newpost" ? "text-red-600" : ""
                  } w-10 h-10 cursor-pointer`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>New post</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <Tooltip>
            <TooltipTrigger>
              <IoNotifications
                className={`${
                  tabOpen === "notifications" ? "text-red-600" : ""
                } w-8 h-8 cursor-pointer`}
                onClick={() => {
                  setIsNotiOpen(true);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
          <Link
            to={`/profile?user=${currentUserDetails?.username}`}
            className="mt-2.5"
          >
            <Tooltip>
              <TooltipTrigger>
                <img
                  src={currentUserDetails?.profilePic || "/pic.jpg"}
                  alt={`Profile picture of ${
                    currentUserDetails?.username || "user"
                  }`}
                  className="w-10 h-10 rounded-full cursor-pointer border-2"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentUserDetails?.username}</p>
              </TooltipContent>
            </Tooltip>
          </Link>
           
          <Link
            to="/settings"
            className=" absolute bottom-10 rounded  transition"
          >
            <Tooltip>
              <TooltipTrigger>
                {tabOpen === "settings" ? (
                  <DotLottieReact
                    src="https://lottie.host/3ecb6b39-26ba-41a9-8ab2-16fbebde1514/QD49nPkF35.lottie"
                    loop
                    autoplay
                    className="w-20 h-12 cursor-pointer"
                  />
                ) : (
                  <DotLottieReact
                    src="https://lottie.host/eb923733-8ca0-40f3-bf18-156631181b02/J1zp6Sxyuz.lottie"
                    loop
                    autoplay
                    className="w-20 h-12 cursor-pointer"
                  />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </Link>
        </nav>
      </aside>

      <div className="sm:hidden fixed bottom-0 left-0 w-full  text-neutral-800 bg-white flex justify-center items-center h-16 z-50">
        <nav className="flex flex-row gap-10 justify-center items-center">
          <Link to="/homepage" className="rounded w-full h-full flex justify-center items-center transition">
            <Tooltip>
              <TooltipTrigger>
                <IoHome
                  className={`${
                    tabOpen === "home" ? "text-red-600" : ""
                  } w-7 h-7 cursor-pointer`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <Link to="/homepage/search" className="rounded w-full h-full flex justify-center items-center transition">
            <Tooltip>
              <TooltipTrigger>
                <FaSearch
                  className={`${
                    tabOpen === "search" ? "text-red-600" : ""
                  } w-6 h-6 cursor-pointer mt-0.5`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Find</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          
          <Link to="/new-post" className="rounded w-full h-full flex justify-center items-center transition">
            <Tooltip>
              <TooltipTrigger>
                <CiCirclePlus
                  className={`${
                    tabOpen === "newpost" ? "text-red-600" : ""
                  } w-9 h-9 cursor-pointer`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>New post</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <Tooltip >
            <TooltipTrigger className="rounded w-full h-full flex justify-center items-center transition">
              <IoNotifications
                className={`${
                  tabOpen === "notifications" ? "text-red-600" : ""
                } w-7 h-7 cursor-pointer `}
                onClick={() => {
                  setIsNotiOpen(true);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
         <Link
          to={`/profile?user=${currentUserDetails?.username}`}
          className="rounded w-full h-full flex justify-center items-center transition"
        >
          <Tooltip>
            <TooltipTrigger>
              <img
                src={currentUserDetails?.profilePic || "/pic.jpg"}
                alt={`Profile picture of ${
                  currentUserDetails?.username || "user"
                }`}
                className={`${
                  tabOpen === "profile" ? "text-red-600" : ""
                } w-7 h-7 cursor-pointer rounded-full `}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentUserDetails?.username}</p>
            </TooltipContent>
          </Tooltip>
        </Link>

        </nav>
      </div>
    </>
  );
}
