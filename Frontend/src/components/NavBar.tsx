import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { IoChatbubbleEllipses, IoNotifications } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useContext } from "react";
import UserContext from "@/context/UserContext";
export default function NavBar() {
 const {currentUserDetails}:any=useContext(UserContext)
    
  return (
   <>
     
      <aside className="hidden sm:flex h-screen w-20  text-black sticky top-0 left-0 flex-col pt-10 overflow-hidden border-r-7">
        <nav className="flex flex-col gap-12  items-center">
          <Link to="/homepage" className="rounded hover:bg-gray-700 transition">
            <Tooltip>
              <TooltipTrigger>
                <IoHome className="w-8 h-8 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
          </Link>

          <Link to="/new-post" className="rounded hover:bg-gray-700 transition">
            <Tooltip>
              <TooltipTrigger>
                <CiCirclePlus  className="w-10 h-10 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>New post</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <Link
            to="/notifications"
            className="rounded hover:bg-gray-700 transition"
          >
            <Tooltip>
              <TooltipTrigger>
                <IoNotifications className="w-8 h-8 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <Link to="/chat" className=" rounded hover:bg-gray-700 transition">
            <Tooltip>
              <TooltipTrigger>
                <IoChatbubbleEllipses className="w-8 h-8 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <Link
            to="/profile"
            className=" absolute bottom-10 rounded hover:bg-gray-700 transition"
          >
            <Tooltip>
              <TooltipTrigger>
                <img src={currentUserDetails.profilePic||"/pic.jpg"} alt="" className="w-10 h-10 rounded-full" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </Link>
        </nav>
      </aside>

      <div className="sm:hidden fixed bottom-0 left-0 w-full  text-black bg-white flex justify-center items-center h-16 z-50">
        <nav className="flex flex-row gap-10">
          <Link to="/homepage" className="rounded hover:bg-gray-700 transition">
            <Tooltip>
              <TooltipTrigger>
                <IoHome className="w-7 h-7"/>
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
          </Link>
         <Link to="/chat" className=" rounded hover:bg-gray-700 transition">
            <Tooltip>
              <TooltipTrigger>
                <IoChatbubbleEllipses className="w-7 h-7" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages</p>
              </TooltipContent>
            </Tooltip>
          </Link>
          <Link to="/new-post" className="rounded hover:bg-gray-700 transition">
            <Tooltip>
              <TooltipTrigger>
                <CiCirclePlus  className="w-7 h-7" />
              </TooltipTrigger>
              <TooltipContent>
                <p>New post</p>
              </TooltipContent>
            </Tooltip>
          </Link>
           <Link
            to="/notifications"
            className="rounded hover:bg-gray-700 transition"
          >
            <Tooltip>
              <TooltipTrigger>
                <IoNotifications className="w-7 h-7" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </Link>
           <Link
            to="/profile"
            className=" "
          >
            <Tooltip>
              <TooltipTrigger>
                <img src={currentUserDetails.profilePic||"/pic.jpg"} alt="" className="w-7 h-7 rounded-full" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </Link>
        </nav>
      </div>
    </>
  );
}
