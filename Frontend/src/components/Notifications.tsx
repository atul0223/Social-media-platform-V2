import { useContext, useEffect, useState } from "react";
import { X, Bell, Check} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserContext from "@/context/UserContext";
import axios from "axios";
import { BACKENDURL } from "@/config";


interface Notification {
  _id: string;
  requestStatus:string;
  requester:{
    username:string;
    profilePic:string;
  }
}

const Notifications: any = () => {
  const[prevTabOpen,setPrevTabOpen]=useState("");

  const { isNotiOpen,setIsNotiOpen, setTabOpen, tabOpen }: any = useContext(UserContext);
    
  useEffect(() => {
    setPrevTabOpen(tabOpen);
     setTabOpen("notifications");
  }, [isNotiOpen]);
  const navigate = useNavigate();
  const onClose = () => {
     setIsNotiOpen(false);
     setTabOpen(prevTabOpen);
  };
  const [notifications, setNotifications] = useState<Notification[]>([
  
  ]);

  if (!isNotiOpen)
    useEffect(() => {
      navigate(-1);
    }, [isNotiOpen]);
    
     const getNotifications = async () => {
      await axios
        .get(`${BACKENDURL}/home/notifications`, { withCredentials: true })
        .then((res) => {
          console.log(res.data);

          setNotifications(res.data.notifications);
        })
        .catch((err) => {
          console.log(err);
        });
    };
  useEffect(() => {
   
   
    getNotifications();
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

       

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((result,index) => (
              
                  <div className="flex w-full bg-gray-200 my-1 " key={index}>
                    <img
                      src={result.requester.profilePic || "/pic.jpg"}
                      alt=""
                      className="w-8 h-8 rounded-full ml-4 mr-2 mt-3 mb-3"
                    
                    />
                    <div className="mt-1 flex items-center cursor-pointer" onClick={()=>navigate(`/profile?user=${result.requester.username}`)}>
                      <h6 className=" text-black">
                        @{result.requester.username}
                      </h6>
                    </div>
                    <div className="font-serif text-black flex items-center">
                      {result.requestStatus === "accepted" ? (
                        <div className="mt-2">
                          {" "}
                          <p className="ml-1">Started following you</p>
                        </div>
                      ) : (
                        <div className="ml-1 flex">
                          <p className="mr-10 mt-1">wants to follow you</p>{" "}
                          <Check
                            className="cursor-pointer mt-1 mr-3"
                            onClick={() => {
                              handleAccept(result.requester.username);
                            }}
                          />
                           
                         
                          <X
                            className="cursor-pointer mt-1 mr-3"
                            onClick={() => {
                              handleReject(result.requester.username);
                            }}
                          />
                        
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
