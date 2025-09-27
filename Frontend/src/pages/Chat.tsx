import { useContext, useEffect, useState } from "react";
import Loading from "../components/Loading.js";

import UserContext from "../context/UserContext.js";

import SingleChat from "../components/SingleChat.js";
import axios from "axios";
import { BACKENDURL } from "../config.js";
import { useNavigate } from "react-router-dom";
import Messages from "../components/Messages.js";
import { FaPlus } from "react-icons/fa";
import CreateGroup from "../components/CreateGroup.js";
import socket from "../helper/socket.js";
import type { Chat, CurrentUserDetails } from "@/Types/Types.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip.js";


export default function Chat() {
  const navigate = useNavigate();
  const [targetSearch, setTargetSearch] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const {
    setTabOpen,
    setLoading,
    fetchCurrentUser,
    accessChat,
    accessMessage,
    isSmallScreen,
    isCreatingGroup,
    setIsCreatingGroup,
  }: any = useContext(UserContext);
  const [searchData, setSearchData] = useState<CurrentUserDetails[]>();
  const handleSearch = async (e: any) => {
    setTargetSearch(e.target.value);
    e.target.value !== "" ? setIsSearching(true) : setIsSearching(false);
    const res = await axios.get(`${BACKENDURL}/home/search?query=${e.target.value}&&searchType=users`, {
      
      withCredentials: true,
    });

    setSearchData(res.data);
  };
  const [chats, setChats] = useState<Chat>();
  const fetchChats = async () => {
    setLoading(true);
    const res = await axios.get(`${BACKENDURL}/chat/`, {
      withCredentials: true,
    });

    setChats(res.data);

    setLoading(false);
  };
  useEffect(() => {
    if(localStorage.getItem("currentUser")===null){
      navigate("/")
    }
    fetchChats();
    socket.on("newMessage", (msg) => {
      chats && (chats.latestMessage = msg.content);
    });
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    setTabOpen("chat");
    socket.on("newMessage", (newMessage) => {
      setChats((prevChats: any) =>
        prevChats.map((chat: any) =>
          chat._id === newMessage.chat._id
            ? { ...chat, latestMessage: newMessage }
            : chat
        )
      );
    });
  }, [socket]);
  const handleAccessChat = (userId: any) => {
    setLoading(true);
    accessChat(userId).then((chatDetails: any) => {
      accessMessage(chatDetails._id);
      localStorage.setItem("selectedChat", JSON.stringify(chatDetails));
    });

    setLoading(false);
  };
  return (
    <div className="w-full max-h-screen sm:grid grid-cols-6 grid-rows-1 pb-20 sm:pb-0">
      <Loading />
      {!isCreatingGroup ? (
        <div className="col-span-2 w-full h-screen bg-neutral-200 p-4 overflow-auto">
          <div className="flex mb-4">
            {" "}
            <img
              src="/arrow.png"
              alt=""
              className="w-10 h-10 hover:bg-gray-500 rounded-xl active:bg-gray-500 active:w-9 active:h-9 sm:hidden"
              onClick={() => {
                navigate(-1);
              }}
            />
            <h4 className="font-serif mt-1 ml-3 text-2xl">Chats</h4>
            <div className="w-full h-full flex justify-end items-center mt-2.5 mr-3">
             
             <Tooltip>
            <TooltipTrigger>
              <FaPlus
                className="w-5 h-5 text-orange-600 cursor-pointer"
                onClick={() => setIsCreatingGroup(true)}
              /> 
            </TooltipTrigger>
            <TooltipContent>
              <p>New Group</p>
            </TooltipContent>
          </Tooltip>
              
            </div>
          </div>
          <hr />
          <input
            className="bg-white w-full h-13 rounded-xl px-3  mt-4"
            type="search"
            placeholder="Search @username"
            aria-label="Search"
            value={targetSearch}
            onChange={handleSearch}
            autoFocus
          />

          {isSearching ? (
            <>
              {searchData?.map((item: CurrentUserDetails, index) => {
                return (
                  <div key={item._id} className="mt-3 cursor-pointer">
                    <div
                      className="w-full rounded-2xl  h-20 hover:bg-neutral-300 flex  items-center mb-1 "
                      key={index}
                      onClick={() => {
                        handleAccessChat(item._id);
                        isSmallScreen ? navigate("/chat/messages") : <></>;
                      }}
                    >
                      <div className="w-12 h-12 rounded-full">
                        <img
                          src={item.profilePic || "/pic.jpg"}
                          alt=""
                          className="md:w-12 md:h-12 rounded-full w-10 h-10 bg-gray-400"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="font-serif">@{item.username}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="mt-4 ">
              {chats &&
                Object.entries(chats).map((chat: any) => {
                  return (
                    <div key={chat[1]._id}>
                      <SingleChat chat={chat[1]} key={chat._id} />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        <div className="col-span-2">
          <CreateGroup />
        </div>
      )}
      <div className="col-span-4 w-full min-h-screen bg-gray-100 sm:block hidden ">
        <Messages />
      </div>
    </div>
  );
}
