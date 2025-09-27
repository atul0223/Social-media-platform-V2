import { useContext } from "react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import UserContext from "@/context/UserContext";
import { IoChatbubbleEllipses } from "react-icons/io5";

export default function SearchBar() {
  const { tabOpen, setSearch }: any = useContext(UserContext);
  const navigate = useNavigate();
  if (tabOpen === "search" || tabOpen === "home") {
    return (
      <div className="w-full h-15 flex justify-center items-center mt-2 px-3 gap-3 mb-3 sm:mb-0 sticky top-0 bg-white z-10">
        <PlaceholdersAndVanishInput
          placeholders={[
            "Search",
            "Find anyone ?",
            "Explore new",
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
          onSubmit={() => navigate("/homepage/search")}
        />

        <Link to="/chat" className=" rounded  transition">
          <Tooltip>
            <TooltipTrigger>
              <IoChatbubbleEllipses
                className="text-gray-600 w-9 h-9 cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Messages</p>
            </TooltipContent>
          </Tooltip>
        </Link>
      </div>
    );
  } else {
    return null;
  }
}
