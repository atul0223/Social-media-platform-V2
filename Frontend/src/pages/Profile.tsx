import { useEffect, useState, useContext } from "react";
import { CardPosts, PostsPrivate } from "../components/CardPosts";
import axios from "axios";
import { BACKENDURL } from "../config";
import UserContext from "../context/UserContext";
import Loading from "@/components/Loading";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Profile() {
  const {
    targetuser,
    fetchUser,
    setTabOpen,
    setLoading,
   
  }: any = useContext(UserContext);
  
  
  
  const [searchParams] = useSearchParams();
  const user = searchParams.get("user");
  const navigate = useNavigate();
  const [choice, setChoice] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [canSee, setCansee] = useState(true);
  const fetchuser = async () => {
    setLoading(true);

    const data = await fetchUser(user);

    const newRequestStatus = data?.requestStatus;

    if (newRequestStatus === "requested" || newRequestStatus === "unfollow") {
      setChoice(false);
    } else if (newRequestStatus === "follow") {
      setChoice(true);
    }
    const shouldHidePosts =
      data?.isBlocked ||
      (data?.isPrivate && !data?.profileDetails.isFollowing && !data?.sameUser);
    setCansee(!shouldHidePosts);
    setLoading(false);
  };
  const toggleBlock = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BACKENDURL}/profile/${targetuser.username}/toggleBlock`,
        { block: !targetuser.isblocked },
        { withCredentials: true }
      );
      console.log(res.data);

      await fetchuser();
    } catch (error) {
      console.error("Toggle block failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const toggleFollow = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${BACKENDURL}/profile/${targetuser.username}/toggleFollow`,
        { follow: choice },
        { withCredentials: true }
      );

      fetchuser();
    } catch (error) {
      console.error("Toggle follow failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const currentUserDetails =JSON.parse(localStorage.getItem("currentUser"));
  useEffect(() => {
    const currentUserDetails =localStorage.getItem("currentUser") 
    if (currentUserDetails=== null) {
      navigate("/");
    }

    setTabOpen("profile");

    fetchuser();
  }, [user]);

  return (
    <>
      <div className="w-full h-full sm:px-20 md:px-30 xl:px-40 px-4 select-none">
        <div>
          <Loading />
        {currentUserDetails.username===user?<Link
            to="/settings"
            className=" z-50  rounded-full mt-4 -mr-3 flex items-center justify-end transition sm:hidden "
          >
            <Tooltip>
              <TooltipTrigger>
                
                 <DotLottieReact
                    src="https://lottie.host/eb923733-8ca0-40f3-bf18-156631181b02/J1zp6Sxyuz.lottie"
                    loop
                    autoplay
                    className="w-17 h-10 cursor-pointer"
                  />  
               
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </Link>:<></>}
          <div className="h-100 w-full flex flex-wrap justify-center sm:mt-10 ">
            <div className="rounded-full w-45 h-45 overflow-hidden mt-7">
              <img
                src={targetuser.profilePic || "/pic.jpg"}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="w-full flex justify-center ">
              <h1 className="text-center"> @{targetuser.username}</h1>
            </div>
            <div className="w-full flex justify-center gap-12">
              <div>{targetuser.postCount} posts</div>
              <div className="cursor-pointer hover:underline">{targetuser.followerCount} followers</div>
              <div className="cursor-pointer hover:underline">{targetuser.followingCount} following</div>
            </div>

            {targetuser.sameUser === true ? (
              <> </>
            ) : (
              <div className="mb-10 flex mt-3 gap-10">
                {targetuser.isblocked ? (
                  <></>
                ) : (
                  <button
                    className="p-[3px] relative   cursor-pointer"
                    value={targetuser.isfollowing}
                    onClick={toggleFollow}
                    disabled={isLoading}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        targetuser.requestStatus === "follow"
                          ? "from-indigo-500 to-purple-500 "
                          : "from-neutral-500 to-neutral-200 "
                      }rounded-lg `}
                    />
                    <div className="px-2 bg-transparent rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                      {targetuser.requestStatus === "requested"
                        ? "Requested"
                        : targetuser.isFollowing
                        ? "Unfollow"
                        : "Follow"}
                    </div>
                  </button>
                )}
                <button
                  className="p-[3px] relative   cursor-pointer"
                  value={targetuser.isblocked}
                  onClick={toggleBlock}
                  disabled={isLoading}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${
                      targetuser.isblocked
                        ? " from-neutral-500 to-neutral-400"
                        : " from-red-500 to-orange-400"
                    } 500 rounded-lg `}
                  />
                  <div className="px-2 bg-transparent rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                    {targetuser.isblocked ? "Unblock" : "Block"}
                  </div>
                </button>
              </div>
            )}
          </div>
          <div className=" mb-10 ">
            <hr />
            <h1 className="text-center text-stone-600 font-serif text-3xl my-3">
              Moments
            </h1>
            <hr />
          </div>

          <div className="flex justify-center pb-4">
            {targetuser.isblocked ? (
              <></>
            ) : canSee ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-3.5 sm:gap-5 h-full pb-20 sm:pb-0 ">
                {targetuser.postCount === 0 ? (
                  <div className=" font-light mt-10 font-serif col-span-3 lg:ml-12 font-center ">
                    <h4 className="text-2xl">No posts</h4>
                  </div>
                ) : (
                  Object.entries(targetuser.posts).map(
                    ([index, postItem]: any) => (
                      <CardPosts
                        postItem={postItem}
                        postKey={index}
                        key={index}
                      />
                    )
                  )
                )}
              </div>
            ) : (
              <PostsPrivate />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
