import { useContext, useEffect, useMemo, useState } from "react";
import { X, Bell, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserContext from "@/context/UserContext";
import axios from "axios";
import { BACKENDURL } from "@/config";

interface NotificationItem {
  _id: string;
  type:
    | "like"
    | "comment"
    | "follow"
    | "follow_request"
    | "follow_accept"
    | "message";
  message: string;
  preview?: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    _id: string;
    username: string;
    profilePic: string;
  };
  target?: {
    postId?: string;
    commentId?: string;
    chatId?: string;
  };
}

const Notifications: any = () => {
  const[prevTabOpen,setPrevTabOpen]=useState("");

  const {
    isNotiOpen,
    setIsNotiOpen,
    setTabOpen,
    tabOpen,
    accessChat,
    accessMessage,
  }: any = useContext(UserContext);
    
  useEffect(() => {
    setPrevTabOpen(tabOpen);
     setTabOpen("notifications");
  }, [isNotiOpen]);
  const navigate = useNavigate();
  const onClose = () => {
     setIsNotiOpen(false);
     setTabOpen(prevTabOpen);
  };
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushChecking, setPushChecking] = useState(false);

  useEffect(() => {
    if (!isNotiOpen) {
      navigate(-1);
    }
  }, [isNotiOpen, navigate]);
    
    const getNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${BACKENDURL}/home/notifications`, {
          withCredentials: true,
        });
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    const checkPushSupport = async () => {
      const supported =
        "serviceWorker" in navigator && "PushManager" in window;
      setPushSupported(supported);
      if (!supported) return;

      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager?.getSubscription();
        setPushEnabled(!!sub);
      } catch (err) {
        console.error("Push check failed:", err);
      }
    };

    useEffect(() => {
      checkPushSupport();
    }, []);

  useEffect(() => {
    getNotifications();
    const interval = setInterval(() => {
      getNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleAccept = async (username:string) => {
     await axios
      .post(
        `${BACKENDURL}/user/handleRequest/${username}`,
        {
          doAccept: true,
        },
        {
          withCredentials: true,
        }
      )
      
      .catch((err) => console.log(err));
  getNotifications()
  };
  const handleReject = async (username:string) => {
   await axios
      .post(
        `${BACKENDURL}/user/handleRequest/${username}`,
        {
          doAccept: false,
        },
        {
          withCredentials: true,
        }
      )
     
      .catch((err) => console.log(err));
  getNotifications()
  };

  const markAllRead = async () => {
    try {
      await axios.post(`${BACKENDURL}/home/notifications/read`, null, {
        withCredentials: true,
      });
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await axios.post(`${BACKENDURL}/home/notifications/${id}/read`, null, {
        withCredentials: true,
      });
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const enablePush = async () => {
    if (!pushSupported) return;
    setPushChecking(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushChecking(false);
        return;
      }
      const keyRes = await axios.get(`${BACKENDURL}/push/vapidPublicKey`);
      const publicKey = keyRes.data?.publicKey;
      if (!publicKey) {
        setPushChecking(false);
        return;
      }

      const reg =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.register("/push-sw.js"));
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await axios.post(
        `${BACKENDURL}/push/subscribe`,
        {
          subscription,
          userAgent: navigator.userAgent,
        },
        { withCredentials: true }
      );
      setPushEnabled(true);
    } catch (err) {
      console.error("Enable push failed:", err);
    } finally {
      setPushChecking(false);
    }
  };

  const disablePush = async () => {
    if (!pushSupported) return;
    setPushChecking(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const subscription = await reg?.pushManager?.getSubscription();
      if (subscription) {
        await axios.post(
          `${BACKENDURL}/push/unsubscribe`,
          { endpoint: subscription.endpoint },
          { withCredentials: true }
        );
        await subscription.unsubscribe();
      }
      setPushEnabled(false);
    } catch (err) {
      console.error("Disable push failed:", err);
    } finally {
      setPushChecking(false);
    }
  };

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  const handleNotificationClick = async (item: NotificationItem) => {
    await markRead(item._id);
    if (item.type === "message") {
      try {
        await accessChat(item.actor._id).then((chatDetails: any) => {
          accessMessage(chatDetails._id);
          localStorage.setItem("selectedChat", JSON.stringify(chatDetails));
        });
        navigate("/chat");
      } catch (err) {
        console.error("Open chat failed:", err);
        navigate("/chat");
      }
      return;
    }
    if (item.type === "like" || item.type === "comment") {
      navigate("/homepage");
      return;
    }
    navigate(`/profile?user=${item.actor.username}`);
  };
  return (
    <>
      {/* Backdrop - only visible on sm+ screens */}
      <div
        className="hidden sm:block fixed inset-0 z-40 "
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div
        className={`
        fixed z-50 bg-white shadow-2xl
        
        /* Mobile: Full screen */
        inset-0 sm:inset-auto
        
        /* Desktop: Popup positioned top-left */
        sm:top-16 sm:left-20 sm:w-96 sm:max-h-[80vh] sm:rounded-lg
        
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 ">
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
        
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 text-sm">
          <button
            className="text-gray-700 hover:text-black"
            onClick={markAllRead}
          >
            Mark all read
          </button>
          {pushSupported ? (
            <button
              className="text-gray-700 hover:text-black disabled:opacity-50"
              onClick={pushEnabled ? disablePush : enablePush}
              disabled={pushChecking}
            >
              {pushEnabled ? "Disable push" : "Enable push"}
            </button>
          ) : (
            <span className="text-gray-400">Push not supported</span>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-lg font-medium">Loading notifications…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <p className="text-lg font-medium">{error}</p>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedNotifications.map((item) => (
                  <div
                    className={`flex w-full my-1 cursor-pointer ${
                      item.isRead ? "bg-white" : "bg-gray-200"
                    }`}
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <img
                      src={item.actor.profilePic || "/pic.jpg"}
                      alt=""
                      className="w-8 h-8 rounded-full ml-4 mr-2 mt-3 mb-3"
                    
                    />
                    <div className="mt-1 flex items-center">
                      <h6 className=" text-black">
                        @{item.actor.username}
                      </h6>
                    </div>
                    <div className="font-serif text-black flex items-center">
                      {item.type === "follow_request" ? (
                        <div className="ml-1 flex">
                          <p className="mr-10 mt-1">{item.message}</p>
                          <Check
                            className="cursor-pointer mt-1 mr-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(item.actor.username);
                            }}
                          />
                          <X
                            className="cursor-pointer mt-1 mr-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(item.actor.username);
                            }}
                          />
                        </div>
                      ) : item.type === "follow" ||
                        item.type === "follow_accept" ? (
                        <div className="mt-2">
                          {" "}
                          <p className="ml-1">{item.message}</p>
                        </div>
                      ) : (
                        <div className="ml-1 flex flex-col">
                          <p className="mr-10 mt-1">{item.message}</p>
                          {item.preview ? (
                            <p className="text-xs text-gray-500 mt-1 max-w-[18rem] truncate">
                              {item.preview}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
             
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
