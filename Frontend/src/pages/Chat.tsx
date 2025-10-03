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
  const [searchData, setSearchData] = useState<CurrentUserDetails[]>([]);
  const [chats, setChats] = useState<Record<string, Chat>>({});

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

  useEffect(() => {
    if (localStorage.getItem("currentUser") === null) {
      navigate("/");
    }
    fetchChats();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    setTabOpen("chat");

    const handleNewMessage = (newMessage: any) => {
      setChats((prevChats) => {
        const updatedChats = { ...prevChats };
        const chatId = newMessage.chat._id;

        if (updatedChats[chatId]) {
          updatedChats[chatId] = {
            ...updatedChats[chatId],
            latestMessage: newMessage.content,
          };
        } else {
          updatedChats[chatId] = {
            ...newMessage.chat,
            latestMessage: newMessage.content,
          };
        }

        return updatedChats;
      });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("connect", () => {
      console.log("Socket reconnected");
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKENDURL}/chat/`, {
        withCredentials: true,
      });
      const chatMap: Record<string, Chat> = {};
      res.data.forEach((chat: Chat) => {
        chatMap[chat._id] = chat;
      });
      setChats(chatMap);
    } catch (err) {
      console.error("Failed to fetch chats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (targetSearch.trim()) {
        axios
          .get(`${BACKENDURL}/home/search?query=${targetSearch}&searchType=users`, {
            withCredentials: true,
          })
          .then((res) => setSearchData(res.data))
          .catch((err) => console.error("Search failed", err));
        setIsSearching(true);
      } else {
        setSearchData([]);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [targetSearch]);

  const handleAccessChat = async (userId: string) => {
    setLoading(true);
    try {
      const chatDetails = await accessChat(userId);
      accessMessage(chatDetails._id);
      localStorage.setItem("selectedChat", JSON.stringify(chatDetails));
    } catch (err) {
      console.error("Access chat failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-h-screen sm:grid grid-cols-6 grid-rows-1 pb-20 sm:pb-0">
      <Loading />
      {!isCreatingGroup ? (
        <div className="col-span-2 w-full h-screen bg-neutral-200 p-4 overflow-auto">
          <div className="flex mb-4">
            <img
              src="/arrow.png"
              alt="Back"
              className="w-10 h-10 hover:bg-gray-500 rounded-xl active:bg-gray-500 active:w-9 active:h-9 sm:hidden"
              onClick={() => navigate(-1)}
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
            className="bg-white w-full h-13 rounded-xl px-3 mt-4"
            type="search"
            placeholder="Search @username"
            value={targetSearch}
            onChange={(e) => setTargetSearch(e.target.value)}
          />

          {isSearching ? (
            <div className="mt-3">
              {searchData.length > 0 ? (
                searchData.map((item) => (
                  <div
                    key={item._id}
                    className="w-full rounded-2xl h-20 hover:bg-neutral-300 flex items-center mb-1 cursor-pointer"
                    onClick={() => {
                      handleAccessChat(item._id);
                      if (isSmallScreen) navigate("/chat/messages");
                    }}
                  >
                    <img
                      src={item.profilePic || "/pic.jpg"}
                      alt={item.username}
                      className="md:w-12 md:h-12 rounded-full w-10 h-10 bg-gray-400"
                    />
                    <div className="ml-3 font-serif">@{item.username}</div>
                  </div>
                ))
              ) : (
                <p className="mt-4 text-gray-500">No users found.</p>
              )}
            </div>
          ) : (
            <div className="mt-4">
              {Object.keys(chats).length > 0 ? (
                Object.entries(chats).map(([id, chat]) => (
                  <SingleChat chat={chat} key={id} />
                ))
              ) : (
                <p className="mt-4 text-gray-500">No chats available.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="col-span-2">
          <CreateGroup />
        </div>
      )}
      <div className="col-span-4 w-full min-h-screen bg-gray-100 sm:block hidden">
        <Messages />
      </div>
    </div>
  );
}