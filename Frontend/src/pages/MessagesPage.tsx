import Messages from "../components/Messages";
import Loading from "../components/Loading";
import { useContext, useEffect } from "react";
import UserContext from "../context/UserContext";

export default function MessagesPage() {
  const { accessMessage, setSelectedChat }: any = useContext(UserContext);
  const handleRefresh = () => {
    const chatString = localStorage.getItem("selectedChat");
    const chat = chatString ? JSON.parse(chatString) : null;
    setSelectedChat(chat);
    chat && accessMessage(chat._id);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="block">
      <Loading />
      <Messages />
    </div>
  );
}
