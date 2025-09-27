import UserContextProvider from "./context/UserContextProvider.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.js";
import Signup from "./pages/SignUp.js";
import ForgotPass from "./pages/ForgotPass.js";

import Homepage from "./pages/Homepage.js";
import { MainLayout } from "./Layout/MainLayout.js";
import Profile from "./pages/Profile.js";
import Settings from "./pages/Settings.js";
import Chat from "./pages/Chat.js";
import MessagesPage from "./pages/MessagesPage.js";
import AddPost from "./pages/AddPost.js";
import Search from "./pages/Search.js";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function App() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat/messages" element={<MessagesPage />} />
          <Route path="/forgotPassword" element={<ForgotPass />} />
          <Route element={<MainLayout />}>
            <Route path="/homepage" element={<Homepage />} />
          </Route>
           <Route element={<MainLayout />}>
            <Route path="/homepage/search" element={<Search />} />
          </Route>
           <Route element={<MainLayout />}>
            <Route path="/new-post" element={<AddPost />} />
          </Route>
           <Route element={<MainLayout />}>
            <Route path="/chat" element={<Chat />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<div className="w-screen h-screen"> <DotLottieReact
      src="https://lottie.host/d1100658-a488-41fe-8e1a-be775a916744/8gqEUKRPxk.lottie"
      loop
      autoplay
    /></div>} />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;
