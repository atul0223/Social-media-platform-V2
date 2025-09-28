import { useState, useContext, useEffect, useRef } from "react";
import { TbTrash } from "react-icons/tb";
import { FaPlus } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { ImExit } from "react-icons/im";
import UserContext from "../context/UserContext";
import { HiDotsVertical } from "react-icons/hi";
import { BACKENDURL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../helper/socket";
import { Button } from "./ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Messages() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };
  const navigate = useNavigate();
  const [isAtBottom, setIsAtBottom] = useState(true);

  const [isGroupSettingsOn, setIsGroupSettingsOn] = useState(false);
  const [sendDisable, setSendDisabled] = useState(false);

  const [targetSearch, setTargetSearch] = useState("");
  const [searchData, setSearchData] = useState<any>([]);
  const handleChangeGroupPic = async (e: any) => {
    setLoading(true);
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);

        const formData = new FormData();
        formData.append("chatId", selectedChat._id);
        formData.append("groupPic", file);
        await axios.put(`${BACKENDURL}/chat/changegrouppic`, formData, {
          withCredentials: true,
        });
        setSelectedChat(null);
        localStorage.removeItem("selectedChat");
        location.reload();
      } catch (error) {}

      setLoading(false);
    }
  };
  const handleSearch = async (e: any) => {
    setTargetSearch(e.target.value);

    const res = await axios.get(`${BACKENDURL}/home/search`, {
      params: { query: e.target.value },
      withCredentials: true,
    });

    const actualData = res.data.filter((item: any) =>
      selectedChat.users.every((user: any) => user._id !== item._id)
    );
    setSearchData(actualData);
  };

  const {
    setLoading,
    selectedChat,
    messages,
    currentUserDetails,
    isSmallScreen,
    setSelectedChat,
    accessMessage,
    fetchCurrentUser,
    setMessages,
  }: any = useContext(UserContext);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userReturn = (users: any) => {
    if (!users) {
      return;
    }
    if (users[0]?.username != currentUserDetails?.username) {
      return users[0];
    } else {
      return users[1];
    }
  };

  const handleRefresh = () => {
    const chat = JSON.parse(localStorage.getItem("selectedChat") || "null");
    setSelectedChat(chat);
    accessMessage(chat?._id);
  };

  const moveToLastMsg = () =>
    bottomRef.current?.scrollIntoView({ behavior: "auto" , block: "end",
});
  useEffect(() => {
    fetchCurrentUser();
    handleRefresh();
    accessMessage(selectedChat?._id).then(() => moveToLastMsg());
    socket.emit("joinChat", selectedChat?._id);

    const container = document.getElementById("message-scroll-container");

    const handleScroll = () => {
      const isBottom = container
        ? container.scrollHeight - container.scrollTop <=
          container.clientHeight + 10
        : false;
      setIsAtBottom(isBottom);
    };

    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [selectedChat?._id]);

  const [newMsg, setNewMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [isChangingGrroupName, setIsChangingGroupName] = useState(false);
  const [typingUser, setTypingUser] = useState<any>(null);
  const [isAddingPeople, setIsAddingPeople] = useState(false);
  const selectedChatMetaData = userReturn(selectedChat?.users);
  const profilePic =
    selectedChat?.chatName === "sender"
      ? userReturn(selectedChat.users)?.profilePic
      : selectedChat?.pic || "/group-chat.png";
  const shouldShowPic = (index: any) => {
    // If it's the last message, always show the profile pic
    if (index === 0) return true;

    const currentSender = messages[index]?.sender?.username;
    const previousSender = messages[index - 1]?.sender?.username;

    // If the next message is from a different sender, show the pic
    return currentSender !== previousSender;
  };
  const handleSendMessage = async (event: any) => {
    setSendDisabled(true);
    if (event.key === "Enter" || newMsg.trim() === "") {
      socket.emit("stop typing", { chatId: selectedChat._id });
    }
    await axios.post(
      `${BACKENDURL}/chat/sendmessage`,
      { chatId: selectedChat._id, content: newMsg },
      { withCredentials: true }
    );
    socket.emit("sendMessage", {
      chat: selectedChat,
      content: newMsg,
      sender: currentUserDetails,
    });

    setSendDisabled(false);
    
    setNewMsg("");
  };
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);
  const handleChangeGroupName = async () => {
    try {
      await axios.put(
        `${BACKENDURL}/chat/renameGroup`,
        { chatId: selectedChat._id, newName: newName },
        { withCredentials: true }
      );

      setIsChangingGroupName(false);
      setSelectedChat(null);
      localStorage.removeItem("selectedChat");
      location.reload();
    } catch (error) {
      console.error("Error changing group name:", error);
    }
  };
  useEffect(() => {
    socket.on("typing", ({ user ,chatId}) => {
      if (chatId === selectedChat._id) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      setTypingUser(user);
      moveToLastMsg();
      
   } });
   socket.on("stop typing", ({ chatId }) => {
  if (chatId === selectedChat._id) {
    setIsTyping(false);
  }
});
    socket.on("connected", () => setSocketConnected(true));
    socket.on("newMessage", (msg) => {
      if (msg.chat._id === selectedChat._id) {
        setMessages((prev: any) => [...prev, msg]);
        moveToLastMsg();
      } else return;
    });

    return () => {
       socket.off("typing");
    socket.off("stop typing");
    socket.off("newMessage");
    socket.off("connected");

    };
  }, [socket, messages]);

  const handleExitGroup = async () => {
    try {
      await axios.put(
        `${BACKENDURL}/chat/exitgroup`,
        { chatId: selectedChat._id },
        { withCredentials: true }
      );

      setSelectedChat(null);
      localStorage.removeItem("selectedChat");
      location.reload();
    } catch (error) {
      console.error("Error exiting group:", error);
    }
  };
  const handleAddPeople = async (userId: any) => {
    try {
      await axios.put(
        `${BACKENDURL}/chat/addtogroup`,
        { chatId: selectedChat._id, userId },
        { withCredentials: true }
      );
      setSearchData([]);

      setSelectedChat(null);
      localStorage.removeItem("selectedChat");
      location.reload();
      alert("User added successfully");
    } catch (error) {
      console.error("Error adding people:", error);
    }
  };
  const handleDeleteGroup = async () => {
    try {
      await axios.put(
        `${BACKENDURL}/chat/deletegroup`,
        { chatId: selectedChat._id },
        { withCredentials: true }
      );

      setSelectedChat(null);
      localStorage.removeItem("selectedChat");
      location.reload();
    } catch (error) {}
  };
  const typingHandler = (e: any) => {
    setNewMsg(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      const user = {
        _id: currentUserDetails._id,
        username: currentUserDetails.username,
        profilePic: currentUserDetails.profilePic,
      };
      socket.emit("typing", { chatId: selectedChat._id, user });
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 2000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  if (!selectedChat?.chatName && !isSmallScreen) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <DotLottieReact
      src="https://lottie.host/c4cd9a75-ebc9-4bf1-b6a2-99bb608d900c/izQVJNhWUM.lottie"
      loop
      autoplay
    />
      </div>
    );
  } else if (isGroupSettingsOn) {
    return (
      <div className=" max-h-screen h-screen bg-gray-200 overflow-y-auto select-none">
        <div
          className="fixed right-7 top-4 w-12 h-12 rounded-full bg-neutral-300 shadow-md flex items-center justify-center hover:bg-white"
          onClick={() => setOpen(true)}
        >
          <HiDotsVertical className="text-gray-500 hover:text-gray-700 cursor-pointer w-7 h-7" />
          {open ? (
            <div className="absolute right-0 mt-20 w-40 bg-white rounded-lg shadow-lg z-50">
              <ul className="py-2 pl-4 text-sm text-gray-700">
                {" "}
                <li
                  className=" py-2 hover:bg-gray-100 cursor-pointer text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                >
                  <img
                    src="/close.png"
                    alt=""
                    className="w-2 h-2 inline-block mr-2  mb-1"
                  />{" "}
                  Cancel
                </li>
                <li
                  className=" py-2 hover:bg-gray-100 cursor-pointer text-red-700 flex"
                  onClick={handleExitGroup}
                >
                  <ImExit className="mt-1 mr-2" /> Exit Group
                </li>
                {selectedChat?.groupAdmin?._id === currentUserDetails._id && (
                  <li
                    className=" py-2 hover:bg-gray-100 cursor-pointer text-red-900  flex"
                    onClick={handleDeleteGroup}
                  >
                    <TbTrash className="mt-0.5 mr-2 w-4 h-4" /> Delete Group
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <></>
          )}
        </div>
        <img
          src="/arrow.png"
          alt=""
          className="w-10 h-10 hover:bg-gray-500 rounded-xl active:bg-gray-500 active:w-9 active:h-9 ml-4 mt-4"
          onClick={() => setIsGroupSettingsOn(false)}
        />
        <div className="h-fit w-full flex flex-wrap justify-center   ">
          <div className="w-full h-fit flex justify-center  mb-10">
            <img
              src={selectedChat?.pic || "/group-chat.png"}
              alt="Group Preview"
              className="object-cover w-45 h-45 rounded-full bg-neutral-400 "
            />

            {selectedChat?.groupAdmin._id === currentUserDetails?._id ? (
              <div className="mt-37 " onClick={handlePickPhoto}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleChangeGroupPic}
                  style={{ display: "none" }}
                />
                <img
                  src="/edit.png"
                  alt="Edit"
                  className="w-5 h-5 hover:w-6 hover:h-6 active:w-4 active:h-4 z-10 "
                />
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="w-full text-center font-serif flex  justify-center ">
            {selectedChat?.groupAdmin._id === currentUserDetails?._id ? (
              isChangingGrroupName ? (
                <div className="flex w-30 mr-25 gap-2">
                  <input
                    type="text"
                    placeholder="New Group Name"
                    className="flex-grow border-b border-neutral-800 focus:outline-none "
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                   
                  />
                  <button
                    className="bg-blue-800 px-3 py-2 cursor-pointer   rounded"
                    onClick={handleChangeGroupName}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-600 px-3 py-2 cursor-pointer  rounded"
                    onClick={() => setIsChangingGroupName(false)}
                  >
                    Cancle
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <h3 className="text-2xl"> {selectedChat.chatName}</h3>
                  <button
                    className="bg-orange-600 px-3 py-1 cursor-pointer   rounded"
                    onClick={() => setIsChangingGroupName(true)}
                  >
                    Edit
                  </button>
                </div>
              )
            ) : (
              <div className="flex gap-2">
                <h3> {selectedChat.chatName}</h3>
              </div>
            )}
          </div>

          <div
            className="sm:w-1/2 w-2/3 max-h-80 rounded-2xl bg-neutral-200  font-serif overflow-y-auto  mt-10 shadow-xl shadow-gray-800 "
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}
          >
            <style>
              {`
      div::-webkit-scrollbar {
        display: none;
      }
    `}
            </style>

            <div className="sticky top-0 bg-neutral-200 w-full flex items-center justify-between pl-3 pr-3 h-13 pt-1">
              <h4 className="mt-2">Peoples </h4>
              <div className="flex gap-2">
                <small className="text-gray-500">
                  ({selectedChat.users.length} members)
                </small>
                {isAddingPeople ? (
                  <img
                    src="/close.png"
                    alt=""
                    className="w-3 h-3 mt-1 hover:w-4 hover:h-4 cursor-pointer hover:mb-1"
                    onClick={() => setIsAddingPeople(false)}
                  />
                ) : (
                  <FaPlus
                    className="hover:text-orange-600 mt-0.5 cursor-pointer"
                    onClick={() => setIsAddingPeople(true)}
                  />
                )}
              </div>
            </div>
            {isAddingPeople ? (
              <>
                <div className="flex items-center ml-7 mb-2 mt-2 mr-10">
                  <input
                    type="text"
                    placeholder="Search @users"
                    className="flex-grow border-b border-neutral-800 focus:outline-none "
                    value={targetSearch}
                    onChange={handleSearch}
                   
                  />
                </div>
                <div className="overflow-y-auto w-full ">
                  {searchData?.map((item: any) => {
                    return (
                      <div key={item._id} className="pr-5 select-none">
                        <div
                          className={`w-full rounded-2xl pl-3 h-20 hover:bg-neutral-100 flex  items-center mb-1 0":""}`}
                          key={searchData._id}
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
                          <FaPlus
                            className="ml-auto cursor-pointer"
                            onClick={() => handleAddPeople(item._id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              selectedChat.users.map((user: any) => (
                <div
                  key={user._id}
                  className="  flex items-center p-2 gap-1 border border-white bg-neutral-200 cursor-pointer hover:bg-neutral-300 hover:font-bold "
                >
                  <img
                    src={user.profilePic || "/pic.jpg"}
                    alt=""
                    className="w-10 h-10 rounded-full mr-2"
                    onClick={() => navigate(`/profile?user=${user.username}`)}
                  />
                  <span
                    onClick={() => navigate(`/profile?user=${user.username}`)}
                  >
                    {user.username}{" "}
                    {selectedChat.groupAdmin._id === user._id ? (
                      <small className="text-red-700">(admin)</small>
                    ) : (
                      <></>
                    )}{" "}
                  </span>
                  {selectedChat.groupAdmin._id === currentUserDetails._id &&
                  selectedChat.groupAdmin._id !== user._id ? (
                    <div className="w-full flex justify-end pr-3">
                      <TbTrash
                        className="ml-2 text-red-700 hover:text-black "
                        onClick={async () => {
                          try {
                            await axios.put(
                              `${BACKENDURL}/chat/removefromgroup`,
                              { chatId: selectedChat._id, userId: user._id },
                              { withCredentials: true }
                            );

                            setSelectedChat(null);
                            localStorage.removeItem("selectedChat");
                            location.reload();
                          } catch (error) {
                            console.error("Error removing user:", error);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full h-screen bg-neutral-100 pb-35">
        <div
          className={`fixed bottom-15 -right-5 flex justify-end items-center px-10 py-6 ${
            isAtBottom ? "hidden" : "block"
          }`}
        >
          <div className="w-11 h-11 bg-gray-950 opacity-75 hover:bg-gray-600 cursor-pointer active:bg-gray-400   text-white rounded-full flex justify-center items-center">
            <MdKeyboardArrowDown
              className="w-10 h-10"
              onClick={moveToLastMsg}
            />
          </div>
        </div>
        <div
          className="sticky w-full h-17 bg-neutral-200 flex items-center cursor-pointer "
          onClick={() => {
            selectedChat.chatName === "sender"
              ? navigate(`/profile?user=${selectedChatMetaData?.username}`)
              : setIsGroupSettingsOn(true);
          }}
        >
          {isSmallScreen ? (
            <img
              src="/arrow.png"
              alt=""
              className="w-10 h-10 hover:bg-gray-500 rounded-xl active:bg-gray-500 active:w-9 active:h-9 ml-4"
              onClick={() => navigate(-1)}
            />
          ) : (
            <></>
          )}
          <img
            src={profilePic || "/pic.jpg"}
            alt=""
            className="w-12 h-12 rounded-full ml-3 bg-gray-400"
          />
          <h6 className="ml-4 mt-1 font-serif">
            {selectedChat?.chatName === "sender" ? (
              "@" + selectedChatMetaData.username
            ) : selectedChat?.groupAdmin?._id === currentUserDetails?._id ? (
              <div className="flex w-full">{selectedChat?.chatName} </div>
            ) : (
              <div>{selectedChat?.chatName}</div>
            )}
          </h6>
        </div>
        <div
          className=" w-full h-full overflow-y-scroll"
          id="message-scroll-container"
        >
          <div className="w-full flex justify-center ">
            <div className=" w-1/2 h-fit flex justify-center items-center p-2 mt-4 mb-4 bg-black opacity-75  break-words rounded m-1 text-amber-300 text-center select-none">
              <small>
                Messages are end-to-end encrypted. Only people in this chat can
                read,
                <br />
                listen to, or share them. Click to learn more
              </small>
            </div>
          </div>
          <div>
            {messages.map((item: any, index: any) => {
              return item.sender._id === currentUserDetails._id ? (
                <div className="flex mr-2 justify-end" key={item?._id}>
                  <div
                    className={`max-w-2/3 w-fit h-fit p-2 bg-orange-600 break-words rounded-tl-xl rounded-br-xl ${
                      shouldShowPic(index) ? "" : "rounded-tr-xl"
                    } rounded-bl-xl mb-1`}
                  >
                    {item.content}
                  </div>

                  <div className="w-11 h-11"></div>
                </div>
              ) : (
                <div className="flex gap-2 ml-2" key={item._id}>
                  {shouldShowPic(index) ? (
                    <img
                      src={item.sender.profilePic || "pic.jpg"}
                      alt=""
                      className="w-10 h-10 rounded-full mr-1"
                    />
                  ) : (
                    <div className="w-11 h-11"></div>
                  )}{" "}
                  <div
                    className={`max-w-2/3 w-fit h-fit p-2 bg-white break-words rounded-tr-xl rounded-br-xl rounded-bl-xl mb-1 ${
                      shouldShowPic(index) ? "" : "rounded-tl-xl"
                    } `}
                  >
                    {item.content}
                  </div>
                </div>
              );
            })}{" "}
            {isTyping ? (
              <div className="flex gap-2 ml-2 w-40 h-fit mt-2">
                <img
                  src={typingUser?.profilePic || "/pic.jpg"}
                  alt=""
                  className="w-10 h-10 rounded-full z-40"
                  onClick={() =>
                    navigate(`/profile?user=${typingUser?.username}`)
                  }
                />
                <DotLottieReact
                  src="https://lottie.host/cd0594d7-ab62-41fc-8057-cdbdb6f57fcf/cWl7H7sbdy.lottie"
                  loop
                  autoplay
                  className="w-full h-full object-cover -ml-15 -mt-4"
                />
              </div>
            ) : null}
            <div ref={bottomRef}  style={{ height: "1px" }}/>
          </div>

          <form
            action="submit"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(e);
            }}
          >
            <div className=" fixed bottom-3 flex gap-3 pl-3 sm:w-7/12 sm:pr-0 w-full pr-5 items-center">
              <input
                className=" form-control mr-sm-2 h-13 bg-white border-orange-200 border-2 w-full rounded-xl px-3 "
                type="text"
                placeholder="Type a message"
                aria-label="Type a message"
                value={newMsg}
                onChange={typingHandler}
               
              />
              <Button
                className="bg-orange-600 h-13"
                disabled={sendDisable || newMsg.trim() === ""}
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
