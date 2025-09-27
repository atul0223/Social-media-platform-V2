import { CardPosts } from "@/components/CardPosts";
import { BACKENDURL } from "@/config";
import UserContext from "@/context/UserContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Search() {
 
  useEffect(() => {
    setTabOpen("search");
  });
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { tabOpen, search ,setTabOpen}: any = useContext(UserContext);
  const navigate =useNavigate();
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSearchResults();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, activeTab]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BACKENDURL}/home/search?query=${search}&searchType=${activeTab}`,
        { withCredentials: true }
      );
      setResults(res.data || []);
    } catch (err) {
      console.error("Search failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  if (tabOpen === "search" || tabOpen === "home") {
    return (
      <div>
        <div className="w-full h-full flex justify-center">
          <div
            className="bg-white  w-full h-full rounded-lg shadow-lg p-3 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex border-b mb-4">
                {["users", "posts"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 font-semibold cursor-pointer ${
                      activeTab === tab
                        ? "border-b-2 border-blue-500 text-blue-600 "
                        : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab(tab as "users" | "posts")}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="w-full h-full ">
                {search && (
                  <p className="text-gray-600 mb-4">
                    Showing {activeTab} results for: <strong>{search}</strong>
                  </p>
                )}

                {loading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : results.length > 0 ? (
                  <div className={`${activeTab !== "users" ? "grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  xl:px-5  gap-3.5 sm:gap-5 h-full" : "grid-cols-1"}`}>
                    {results.map((item, idx) => (
                      <div key={idx} className="">
                        {activeTab === "users" ? (
                          <div
                            key={item._id}
                            className=" cursor-pointer select-none"
                            onClick={()=>{ navigate(`/profile?user=${item.username}`)}}
                          >
                            <div
                              className={`w-full rounded-2xl pl-3 h-20 hover:bg-neutral-100 flex  items-center mb-1 `}
                              key={item._id}
                            >
                              <div className="w-12 h-12 rounded-full">
                                <img
                                  src={item.profilePic || "/pic.jpg"}
                                  alt=""
                                  className="md:w-12 md:h-12 rounded-full w-10 h-10 bg-gray-400"
                                />
                              </div>
                              <div className="ml-3">
                                <div className="font-serif">
                                  @{item.username}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <CardPosts postItem={item} postKey={item._id} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No results found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
