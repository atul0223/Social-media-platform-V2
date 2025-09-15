import axios from "axios";
import { useContext, useState, useEffect } from "react";
import UserContext from "../context/UserContext";
import { BACKENDURL } from "../config";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { Button } from "./ui/button";
import { GlowingEffect } from "./ui/glowing-effect";

export function PostsPrivate() {
  return (
    <div className="flex justify-center mt-7 h-52">
      <div className="w-20 h-20 ">
        <img src="/locked.png" alt="" />
      </div>
      <div className="">
        <h5>
          This account is private <br />
          Follow to see their photos and videos.
        </h5>
      </div>
    </div>
  );
}

export function CardPosts(props: {
  postItem: {
    comments: [];
    commentsCount: number;
    likesCount: number;
    postDetails: {
      _id: string;
      content: string;
      description: string;
      title: string;
    };
    publisherDetails: { username: string; profilePic: string };
  };
  postKey: string;
}) {
  const key = props.postKey;
  const postItem: {
    comments: [];
    commentsCount: number;
    likesCount: number;
    postDetails: {
      _id: string;
      content: string;
      description: string;
      title: string;
    };
    publisherDetails: { username: string; profilePic: string };
  } = props.postItem;
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const { singlePostopen, setsinglePostOpen, currentUserDetails }: any =
    useContext(UserContext);
  const [isLiked, setIsLiked] = useState(false);

  const fetchIsLiked = async (postId: string) => {
    const { data } = await axios.get(
      `${BACKENDURL}/profile/isLiked/${postId}`,
      {
        withCredentials: true,
      }
    );
    setIsLiked(data.isLiked);
  };
  const { fetchUser, targetuser, setLoading }: any = useContext(UserContext);
  const [activePost, setActivePost] = useState({
    comments: [],
    commentsCount: 0,
    likesCount: 0,
    publisherDetails: {
      username: "",
      profilePic: "",
    },
    title: "",
    _id: "",
    content: "",
    descriprion: "",
  });
  const [likeLoading, setLikeLoading] = useState(false);
  const handleAddComment = async (postId: string) => {
    try {
      setLikeLoading(true);
      await axios.post(
        `${BACKENDURL}/profile/${postId}/addComment`,
        {
          inputComment: newComment,
        },
        { withCredentials: true }
      );
      setNewComment("");
      fetchPostDetails(postId);
    } catch (err) {
      console.error("Toggle like failed:", err);
    }

    setLikeLoading(false);
  };
  const handleDeleteComment = async (cId: string, postId: string) => {
    try {
      await axios.delete(`${BACKENDURL}/profile/deleteComment/${cId}`, {
        withCredentials: true,
      });

      fetchPostDetails(postId);
    } catch (err) {
      console.error("Toggle like failed:", err);
    }
  };
  const handleTogleLike = async (postId: string) => {
    try {
      setLikeLoading(true);
      await axios.post(
        `${BACKENDURL}/profile/${postId}/togglelike`,
        {
          like: !isLiked,
        },
        { withCredentials: true }
      );

      fetchPostDetails(postId);
    } catch (err) {
      console.error("Toggle like failed:", err);
    }
    setLikeLoading(false);
  };
  const fetchPostDetails = async (postId: string) => {
    try {
      const res = await axios.get(
        `${BACKENDURL}/profile/getSinglePostComments/${postId}`,
        {
          withCredentials: true,
        }
      );
console.log(res);

      setActivePost(res.data.post);
      setComments(res.data.post.comments);
      await fetchIsLiked(postId);
    } catch (error) {
      console.error("Fetch post details failed:", error);
    }
  };
  const handleOpenModel = async (postId: string) => {
    try {
      setsinglePostOpen(true);
      setLoading(true);
      await fetchPostDetails(postId);
    } catch (error) {
      console.error("Delete post failed:", error);
    }
    setLoading(false);
  };

  const handleDeletePosts = async (postId: string) => {
    try {
      setLoading(true);
      await axios.delete(`${BACKENDURL}/profile/deletePost/${postId}`, {
        withCredentials: true,
      });
      fetchUser(targetuser.username);
    } catch (error) {
      console.error("Delete post failed:", error);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (singlePostopen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [singlePostopen]);

  if (singlePostopen && activePost._id !== "") {
    return (
      <div className="fixed inset-0 z-50 bg-blue-50 flex items-baseline justify-center p-2 select-none">
        <Loading />
        <div className="fixed top-4 right-4 flex justify-center items-center bg-zinc-100 z-50 rounded-full w-12 h-12  shadow-2xl shadow-black">
          <img
            src="/close.png"
            alt=""
            className="w-6 h-6 rounded-full  hover:h-5 hover:w-5"
            onClick={() => {
              setLoading(true);
              window.location.href = window.location.href;
              setsinglePostOpen(false);
              setLoading(false);
            }}
          />
        </div>
        <div className="w-full h-full border-2 border-zinc-200 rounded-3xl shadow-2xl shadow-black sm:flex justify-center gap-5 md:gap-0 overflow-y-scroll sm:overflow-y-visible">
          <div className=" rounded-3xl w-full md:h-3/4 h-2/3 border-2 md:ml-20 md:mr-10 lg:ml-30 lg-mr-10 sm:ml-10 sm:mt-10 xl:ml-40 xl-mr-10 border-gray-300 mb-3 grid grid-rows-12 shadow-2xl shadow-blue-100">
            <div
              className=" h-10 rounded-full m-3 flex gap-2 row-span-1"
              onClick={() => {
                setsinglePostOpen(false);
                navigate(
                  `/profile?user=${activePost.publisherDetails.username}`
                );
              }}
            >
              <img
                src={activePost.publisherDetails.profilePic || "/pic.jpg"}
                alt=""
                className="w-10 h-10 rounded-full"
              />

              <small className="mt-2 hover:cursor-pointer">
                @{activePost.publisherDetails.username}
              </small>
            </div>
            <hr className="mt-4"/>
            
            <div className="max-w-full min-h-3/4 pb-5 justify-center flex row-span-10">
              <img
                src={activePost.content || "img.png"}
                className="rounded-xl"
              />
            </div>
            <div className="max-w-full row-span-1 flex gap-10 p-2 justify-center border-t-1 border-t-gray-200">
              <div
                className="h-6 w-6 hover:w-7 flex gap-2 "
                onClick={() => handleTogleLike(activePost._id)}
                style={likeLoading ? { pointerEvents: "none" } : {}}
              >
                {isLiked ? (
                  <img
                    src="/heart (1).png"
                    alt=""
                    className="hover:w-7 hover:h-7"
                  />
                ) : (
                  <img
                    src="/heart.png"
                    alt=""
                    className="hover:w-7 hover:h-7"
                  />
                )}
                <small>{activePost.likesCount}</small>
              </div>
              <div className="h-6 w-6 hover:w-7 flex gap-2">
                <img
                  src="/comment.png"
                  alt=""
                  className="hover:w-7 hover:h-7"
                />
                <small>{activePost.commentsCount}</small>
              </div>
            </div>
          </div>
           
          <div className="  rounded-4xl w-full h-full max-h-2/3 border-2 sm:mt-10 sm:mr-10 lg:mr-30 border-gray-300 overflow-y-scroll "   style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}  >
            <div className="sticky flex h-20 w-full items-baseline px-6 py-3  gap-3 border-b-2 border-b-gray-200 ">
              <input
                type="text"
                className="h-12 w-full rounded-3xl border-2 p-3 "
                placeholder="Add comment"
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                }}
                autoFocus
              />
              <Button
                className="h-10"
                onClick={() => handleAddComment(activePost._id)}
              >
                Post
              </Button>
            </div>
            <div className="w-full">
              {activePost.comments.length === 0 ? (
                <div className="w-full flex justify-center items-center">
                  <p className="text-gray-600 text-lg">No comments</p>
                </div>
              ) : (
                <div className="space-y-1 w-full">
                  {comments.map((item: any, index) => (
                    <div
                      key={index}
                      className="flex flex-col w-full border rounded-2xl bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={item.commenterDetails.profilePic || "/pic.jpg"}
                          alt={`${item.commenterDetails.username}'s profile`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="font-bold text-sm text-gray-800 pt-2 flex">
                          @{item.commenterDetails.username}
                          {item.commenterDetails.username ===
                          activePost.publisherDetails.username ? (
                            <p className="ml-1">{"  (publisher)"}</p>
                          ) : (
                            <></>
                          )}{" "}
                        </div>
                        {item.commenterDetails.username ===
                        currentUserDetails.username ? (
                          <div className="w-full flex justify-end">
                            <img
                              src="/delete.png"
                              alt=""
                              className="w-5 h-5 hover:w-6 hover:h-6"
                              onClick={() => {
                                handleDeleteComment(item._id, activePost._id);
                              }}
                            />
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 break-words whitespace-normal">
                        {item.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      
      
        <div
          key={`${key}-${postItem.postDetails._id}`}
       
        >  <Loading />
         <div className= " shadow-purple-200 shadow-sm relative h-fit rounded-2xl border md:rounded-3xl">
            
            <GlowingEffect
              blur={0}
              borderWidth={5}
              spread={80}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
            />
          <div
            onClick={() => {
              handleOpenModel(postItem.postDetails._id);
            }}
          >
            <img
              src={postItem.postDetails.content}
              alt="Post Image"
              className=" rounded-2xl object-fill  group-hover:brightness-75  sm:h-90 sm:w-70 w-40 h-60 "
            />
          </div>

          {postItem.postDetails._id === currentUserDetails._id ? (
            <div
              className="absolute top-3 right-3 sm:group-hover:bottom-0 sm:opacity-1 group-hover:opacity-100  rounded-2xl overflow-hidden w-10 h-10 hover:w-11 hover:h-11"
              onClick={() => handleDeletePosts(postItem.postDetails._id)}
            >
              <img
                src="/delete.png"
                alt="/delete.png"
                // data_id={postItem.postDetails._id}
              />
            </div>
          ) : (
            <></>
          )}
          </div>
        </div>
      
    );
  }
}
