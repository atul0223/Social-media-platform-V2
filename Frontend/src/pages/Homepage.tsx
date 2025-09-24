import { CardPosts } from "@/components/CardPosts";
import Loading from "@/components/Loading";

import { BACKENDURL } from "@/config";
import UserContext from "@/context/UserContext";
import type { PostType } from "@/Types/Types";
import axios from "axios";

import { useCallback, useContext, useEffect, useRef, useState } from "react";

export default function Homepage() {
  const [posts, setPosts] = useState<PostType[]>([]);

  const [page, setPage] = useState(1);
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

  const { setLoading ,setTabOpen}: any = useContext(UserContext);

  const limit = 4;

  useEffect(() => {
    setTabOpen("home")
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BACKENDURL}/home?page=${page}&limit=${limit}`,
          {
            withCredentials: true,
          }
        );
        if (res.data.feedPosts.length < limit) {
          setHasMore(false);
        }

        setPosts((prev) => [...prev, ...res.data.feedPosts]);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  return (
    <div className="h-full w-full  flex flex-wrap justify-center  px-3 sm:py-6  pb-20 sm:pb-0">
      {" "}
      <Loading />
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  xl:px-5  gap-3.5 sm:gap-5 h-full  ">
        {posts.map((postItem: PostType, index) => {
          const isLast = index === posts.length - 1;

          return (
            <div key={postItem.postDetails._id}>
              <CardPosts
                postItem={postItem}
                postKey={postItem.postDetails._id}
              />
              {isLast && <div ref={bottomRef}></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
