import Messages from "../components/Messages";
import Loading from "../components/Loading";
import { useContext, useEffect } from "react";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function MessagesPage() {
  const { accessMessage, setSelectedChat }: any = useContext(UserContext);
  const navigate = useNavigate();
  const handleRefresh = () => {
    const chatString = localStorage.getItem("selectedChat");
    const chat = chatString ? JSON.parse(chatString) : null;
    setSelectedChat(chat);
    chat && accessMessage(chat._id);
  };

  useEffect(() => {
    if (localStorage.getItem("currentUser") === null) {
      navigate("/");
    }
    handleRefresh();
  }, []);

  return (
    <div >
      <Loading />
      <Messages />
    </div>
  );
}
