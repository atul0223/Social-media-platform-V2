import { useContext, useState } from "react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import UserContext from "@/context/UserContext";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const { currentUserDetails, tabOpen }: any = useContext(UserContext);
  if (tabOpen === "home") {
    return (
      <div className="w-full h-15 flex justify-center items-center sm:mt-2 px-3 gap-3 mb-3 sm:mb-0">
        <PlaceholdersAndVanishInput
          placeholders={[
            "Serach",
            "Find anyone ?",
            "Explore new",
            "trending",
            "Trending reels 🔥",
            "Top creators near you 📍",
            "Viral memes of the week 😂",
            "AI-generated art 🧠🎨",
            "Fitness tips & routines 💪",
            "Startup founders to follow 🚀",
            "Photography inspiration 📸",
            "Tech news & gadgets 🧑‍💻",
            "Relationship advice ❤️",
            "Motivational quotes 🌟",
            "Fashion trends 2025 👗",
            "Crypto & finance updates 💸",
            "Book recommendations 📚",
            "Mental health check-ins 🧘",
            "Live music & concerts 🎶",
            "Food recipes & hacks 🍳",
            "Gaming clips & walkthroughs 🎮",
            "Behind the scenes 🎬",
            "Pet videos 🐶🐱",
            "Weekend plans near you 🗓️",
          ]}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={() => {}}
        />
        <Link
          to={`/profile?user=${currentUserDetails?.username}`}
          className="mt-2.5 "
        >
          <Tooltip>
            <TooltipTrigger>
              <img
                src={currentUserDetails?.profilePic || "/pic.jpg"}
                alt=""
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer border-2"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentUserDetails?.username}</p>
            </TooltipContent>
          </Tooltip>
        </Link>{" "}
      </div>
    );
  }
}
