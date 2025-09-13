import UserContextProvider from "./context/UserContextProvider.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.js";
import Signup from "./pages/SignUp.js";
import ForgotPass from "./pages/ForgotPass.js";
function App() {
   return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
      <Route path="/" element={<Login/>}></Route>
      <Route path="/signup" element={<Signup/>}></Route>
      <Route path="/forgotPassword" element={<ForgotPass/>}></Route>
    </Routes>
    </BrowserRouter>
    </UserContextProvider>
  )
}

export default App
