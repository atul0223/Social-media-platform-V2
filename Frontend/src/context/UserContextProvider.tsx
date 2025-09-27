import { useState, useEffect } from "react";
import UserContext from "./UserContext";
import axios from "axios";
import { BACKENDURL } from "../config";
import type { CurrentUserDetails } from "@/Types/Types";
export default function UserContextProvider({ children }: any) {
  const [singlePostopen, setsinglePostOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserDetails, setCurrentUserDetails] =
    useState<CurrentUserDetails>();
  const [selectedChat, setSelectedChat] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [tabOpen, setTabOpen] = useState("home");
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [targetuser, setTargetUser] = useState({
    isPrivate: false,
    posts: {},
    profilePic: "/pic.jpg",
    username: "",
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
    isFollowing: false,
    requestStatus: "follow",
    sameUser: false,
    isblocked: false,
  });
  const accessMessage = async (chatId: string) => {
    setLoading(true);
    const res = await axios.get(`${BACKENDURL}/chat/${chatId}/getMessages`, {
      withCredentials: true,
    });

    setMessages(res.data);

    setLoading(false);
    return res.data;
  };
  const accessChat = async (userId: string) => {
    const res = await axios.post(
      `${BACKENDURL}/chat/accessChat`,
      { userId1: userId },
      { withCredentials: true }
    );

    setSelectedChat(res.data);
    return res.data;
  };
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${BACKENDURL}/user/getUser`, {
        withCredentials: true,
      });
      localStorage.setItem("currentUser", JSON.stringify(response.data));
      const rawUser = localStorage.getItem("currentUser");
      if (rawUser) {
        setCurrentUserDetails(JSON.parse(rawUser));
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    setIsSmallScreen(mediaQuery.matches);
    fetchCurrentUser();
    const handler = (e: any) => setIsSmallScreen(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const fetchUser = async (username: string) => {
    try {
      const response = await axios.get(`${BACKENDURL}/profile/${username}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const data = response.data;

        setTargetUser({
          isPrivate: data.isPrivate,
          posts: data.posts,
          username: data.profileDetails.username,
          followerCount: data.profileDetails.followersCount,
          followingCount: data.profileDetails.followingCount,

          profilePic: data.profileDetails.profilePic,

          postCount: data.profileDetails.postsCount,
          isFollowing: data.profileDetails.isFollowing,
          requestStatus: data.requestStatus,
          sameUser: data.sameUser,
          isblocked: data.isBlocked,
        });
        return response.data;
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        targetuser,
        fetchUser,
        loading,
        setLoading,
        singlePostopen,
        setsinglePostOpen,
        fetchCurrentUser,
        currentUserDetails,
        accessChat,
        accessMessage,
        selectedChat,
        setSelectedChat,
        messages,
        setMessages,
        isSmallScreen,
        isCreatingGroup,
        setIsCreatingGroup,
        tabOpen,
        setTabOpen,
        isNotiOpen,
        setIsNotiOpen,
        search,
        setSearch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
