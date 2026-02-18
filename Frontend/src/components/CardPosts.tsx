import axios from "axios";
import { useContext, useState, useEffect, useCallback, useRef } from "react";
import UserContext from "../context/UserContext";
import { BACKENDURL } from "../config";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { Button } from "./ui/button";
import { GlowingEffect } from "./ui/glowing-effect";
import type { CommentType, PostType } from "@/Types/Types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TbTrash } from "react-icons/tb";
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

export function CardPosts(props: { postItem: PostType; postKey: string }) {
  const key = props.postKey;
  const postItem: PostType = props.postItem;
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [activePost, setActivePost] = useState<PostType>({
    isLiked: false,
    commentsCount: 0,
    likesCount: 0,
    publisherDetails: {
      username: "",
      profilePic: "",
    },
    postDetails: {
      title: "",
      _id: "",
      content: "",
      description: "",
    },
  });
  const [isLiked, setIsliked] = useState(activePost.isLiked);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const bottomRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );
  const {
    singlePostopen,
    setsinglePostOpen,
    currentUserDetails,
    fetchUser,
    targetuser,
    setLoading,
  }: any = useContext(UserContext);
  const formatLikes = (likes: number): string => {
    if (likes >= 1000000) {
      return `${(likes / 1000000).toFixed(1)}M`;
    } else if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComment.trim();
    if (!commentText) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentType = {
      _id: tempId,
      comment: commentText,
      commenterDetails: {
        username: currentUserDetails.username,
        profilePic: currentUserDetails.profilePic,
      },
    };

    setCommentsCount((prev) => prev + 1);
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment("");

    try {
      setLikeLoading(true);
      const res = await axios.post(
        `${BACKENDURL}/profile/${postId}/addComment`,
        {
          inputComment: commentText,
        },
        { withCredentials: true }
      );
      const savedComment: CommentType = {
        _id: res.data._id,
        comment: commentText,
        commenterDetails: {
          username: currentUserDetails.username,
          profilePic: currentUserDetails.profilePic,
        },
      };
      setComments((prev) =>
        prev.map((comment) => (comment._id === tempId ? savedComment : comment))
      );
    } catch (err) {
      console.error("Add comment failed:", err);
      setCommentsCount((prev) => Math.max(prev - 1, 0));
      setComments((prev) => prev.filter((comment) => comment._id !== tempId));
      setNewComment(commentText);
    }

    setLikeLoading(false);
  };
  const handleDeleteComment = async (cId: string) => {
    try {
      await axios.delete(`${BACKENDURL}/profile/deleteComment/${cId}`, {
        withCredentials: true,
      });
      setCommentsCount((prev) => prev - 1);
      setComments((prev) => prev.filter((comment) => comment._id !== cId));
    } catch (err) {
      console.error("Toggle like failed:", err);
    }
  };
  const handleTogleLike = async (postId: string) => {
    const prevIsLiked = isLiked;
    const prevLikesCount = likesCount;
    const nextIsLiked = !prevIsLiked;

    setIsliked(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : Math.max(prev - 1, 0)));

    try {
      setLikeLoading(true);
      await axios.post(
        `${BACKENDURL}/profile/${postId}/togglelike`,
        {
          like: nextIsLiked,
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Toggle like failed:", err);
      setIsliked(prevIsLiked);
      setLikesCount(prevLikesCount);
    }
    setLikeLoading(false);
  };

  const fetchComments = async (singlePost: PostType) => {
    try {
      const res = await axios.get(
        `${BACKENDURL}/profile/getSinglePostComments/${singlePost.postDetails._id}?page=${page}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );
      if (res.data.comments.length < limit) {
        setHasMore(false);
      }

      setComments((prev) => [...prev, ...res.data.comments]);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };
  useEffect(() => {
    if (activePost.postDetails._id) {
      fetchComments(activePost);
    }
  }, [page, activePost]);
  const handleOpenModel = async (singlePost: PostType) => {
    try {
      setsinglePostOpen(true);
      setComments([]);
      setPage(1);
      setHasMore(true);
      setActivePost(singlePost);
      setLoading(true);
      setIsliked(singlePost.isLiked);
      setLikesCount(singlePost.likesCount);
      setCommentsCount(singlePost.commentsCount);
    } catch (error) {
      console.error("Delete post failed:", error);
    }
    setLoading(false);
  };

  const handleCloseModel = () => {
    setsinglePostOpen(false);
    setComments([]);
    setPage(1);
    setHasMore(true);
    setActivePost({
      isLiked: false,
      commentsCount: 0,
      likesCount: 0,
      publisherDetails: {
        username: "",
        profilePic: "",
      },
      postDetails: {
        title: "",
        _id: "",
        content: "",
        description: "",
      },
    });
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

  if (singlePostopen && activePost.postDetails._id !== "") {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-200 flex items-baseline justify-center p-2 select-none">
        <Loading />
        <div className="fixed top-4 right-4 flex justify-center items-center bg-neutral-300 z-50 rounded-full w-12 h-12  shadow-2xl shadow-black">
          <img
            src="/close.png"
            alt=""
            className="w-6 h-6 rounded-full  hover:h-5 hover:w-5 cursor-pointer"
            onClick={handleCloseModel}
          />
        </div>
        <div className="w-full h-full border-2 border-zinc-200 rounded-3xl shadow-2xl shadow-black sm:flex justify-center gap-5 md:gap-0 overflow-y-scroll sm:overflow-y-visible">
          <div className=" sm:rounded-3xl rounded-t-3xl w-full md:h-3/4 h-2/3 border-2 md:ml-20 md:mr-10 lg:ml-30 lg-mr-10 sm:ml-10 sm:mt-10 xl:ml-40 xl-mr-10 border-gray-300 grid grid-rows-12 sm:shadow-2xl shadow-gray-100 bg-neutral-200">
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
                className="w-10 h-10 rounded-full cursor-pointer"
              />

              <small className="mt-2 hover:cursor-pointer">
                @{activePost.publisherDetails.username}
              </small>
            </div>

            <div className="max-w-full min-h-3/4 pb-5 justify-center flex row-span-10 m-4">
              <img
                src={activePost.postDetails.content || "img.png"}
                className="rounded-xl"
              />
            </div>
            <div className="max-w-full row-span-1 flex gap-10 p-2 justify-center border-t-1 border-t-gray-200">
              <div
                className="h-6 w-6 hover:w-7 flex gap-2 "
                onClick={() => handleTogleLike(activePost.postDetails._id)}
                style={likeLoading ? { pointerEvents: "none" } : {}}
              >
                {isLiked ? (
                  <img src="/heart (1).png" alt="" className="cursor-pointer" />
                ) : (
                  <img src="/heart.png" alt="" className="cursor-pointer" />
                )}
                <small>{formatLikes(likesCount)}</small>
              </div>
              <div className="h-6 w-6 hover:w-7 flex gap-2">
                <img src="/comment.png" alt="" className="cursor-pointer " />
                <small>{commentsCount}</small>
              </div>
              {activePost?.publisherDetails.username ===
              currentUserDetails?.username ? (
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <TbTrash className="w-7 h-7 -mt-1  cursor-pointer" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this post and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeletePosts(activePost?.postDetails?._id)
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="w-full h-full sm:mr-10 lg:mr-30">
            <div
              className="sm:rounded-xl w-full h-fit max-h-1/5 border-2 sm:mt-10 sm:mr-10 lg:mr-30 border-gray-300 overflow-y-scroll  sm:shadow-2xl shadow-gray-100 p-4 bg-neutral-200"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE 10+
              }}
            >
              <div className="flex gap-1 font-light">
                <h1 className="font-bold">Title : </h1>
                <h1>{activePost.postDetails.title}</h1>
              </div>
              <div className="flex gap-1 font-light">
                <h2 className="font-bold">Description : </h2>
                <p>{activePost.postDetails.description}</p>
              </div>
            </div>
            <div
              className="  sm:rounded-4xl rounded-b-4xl w-full h-full sm:max-h-2/3 border-2 sm:mt-4 sm:mr-10 lg:mr-30 border-gray-300 overflow-y-scroll sm:shadow-2xl shadow-gray-100 bg-neutral-200"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE 10+
              }}
            >
              <div className="sticky flex h-20 w-full items-baseline px-6 py-3  gap-3 border-b-2 border-b-gray-200 ">
                <input
                  type="text"
                  className="h-12 w-full rounded-3xl border-2 p-3 border-neutral-400"
                  placeholder="Add comment"
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                  }}
                
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment(activePost.postDetails._id);
                    }
                  }}
                />
                <Button
                  className="h-10 cursor-pointer"
                  onClick={() => handleAddComment(activePost.postDetails._id)}
                >
                  Post
                </Button>
              </div>
              <hr className=" border-neutral-400" />
              <div className="w-full">
                {comments.length === 0 ? (
                  <div className="w-full flex justify-center items-center mt-4">
                    <p className="text-gray-600 text-lg">No comments</p>
                  </div>
                ) : (
                  <div className="space-y-1 w-full shadow-2xl">
                    {comments.map((item: CommentType, index) => (
                      <div
                        key={index}
                        className="flex flex-col w-full border rounded-2xl bg-neutral-200 p-3 hover:bg-neutral-300"
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
                                className="w-5 h-5 cursor-pointer"
                                onClick={() => {
                                  handleDeleteComment(item._id);
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
                        {index === comments.length - 1 && (
                          <div ref={bottomRef}></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div key={`${key}-${postItem?.postDetails?._id}`}>
        {" "}
        <Loading />
        <div className=" shadow-purple-200 shadow-sm relative h-fit rounded-2xl border md:rounded-3xl max-w-screen">
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
              handleOpenModel(postItem);
            }}
          >
            <img
              src={postItem?.postDetails?.content}
              alt="Post Image"
              className=" rounded-2xl object-fill  group-hover:brightness-75  sm:h-90 sm:w-70 w-40 h-60 "
            />
          </div>
        </div>
      </div>
    );
  }
}
