import { useState } from "react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";

export default function SearchBar() {
  const[search,setSearch]=useState("")
  return (
    <div className="w-full h-17 flex justify-center items-center sm:border-b-2 px-3">
       
      <PlaceholdersAndVanishInput
        placeholders={["Serach","Find anyone ?","Explore new","trending", "Trending reels 🔥",
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
  "Weekend plans near you 🗓️"
]}
        onChange={(e)=>setSearch(e.target.value)}
        onSubmit={()=>{}}
      />
    </div>
  )
}