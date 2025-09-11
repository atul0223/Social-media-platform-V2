import UserContextProvider from "./context/UserContextProvider.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.js";
function App() {
   return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
      <Route path="/" element={<Login/>}></Route>
    </Routes>
    </BrowserRouter>
    </UserContextProvider>
  )
}

export default App
