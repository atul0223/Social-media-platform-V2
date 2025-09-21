import UserContextProvider from "./context/UserContextProvider.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.js";
import Signup from "./pages/SignUp.js";
import ForgotPass from "./pages/ForgotPass.js";

import Homepage from "./pages/Homepage.js";
import { MainLayout } from "./Layout/MainLayout.js";
function App() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotPassword" element={<ForgotPass />} />
          <Route element={<MainLayout />}>
            <Route path="/homepage" element={<Homepage />} />
          </Route>
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;
