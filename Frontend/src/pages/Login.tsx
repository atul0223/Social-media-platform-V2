import FloatingInput from "@/components/FloatingInput";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import UserContext from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { BACKENDURL } from "@/config";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [trustDevice, setTruestDevice] = useState(true);
  const [error, setError] = useState("");
  const { loading, setLoading }: any = useContext(UserContext);
  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      setError(""); // Clear error when user types
    };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await axios
      .post(
        `${BACKENDURL}/user/login`,
        { username, password },
        { withCredentials: true }
      )
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch((_error) => {
        setLoading(false);
        setError(_error.response?.data?.message);
      });
    console.log(res);
  };

  return (
    <div
      className={`w-screen min-h-screen flex justify-center items-center bg-neutral-300 ${
        loading ? "opacity-75" : ""
      }`}
    >
      <Loading />
      <BackgroundBeamsWithCollision className=" lg:w-1/3 sm:w-2/3 md:w-1/2 mb-10 sm:mb-0 h-3/4 w-11/12 shadow-2xl bg-neutral-200 rounded-2xl p-4 shadow-black overflow-hidden pt-15 sm:pt-10 ">
        <h1 className="text-4xl font-serif text-center text-shadow-2xs">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="mt-10">
          <FloatingInput
            type="text"
            label="Username"
            value={username}
            onChange={handleChange(setUsername)}
            error={error}
            readOnly={loading}
          />
          <FloatingInput
            type="password"
            label="Password"
            value={password}
            onChange={handleChange(setPassword)}
            error={error}
            readOnly={loading}
          />
          <input
            type="checkbox"
            id="trustDevice"
            checked={trustDevice}
            readOnly={loading}
            onChange={() => setTruestDevice((prev) => !prev)}
            className="m-2"
          />
          <label htmlFor="trustDevice">Trust this device?</label>
          <Button className="w-full mt-4" type="submit" disabled={loading}>
            Login
          </Button>
        </form>
        <div className="w-full font-bold">
          <hr />
          <p className=" mt-4 mb-3 text-center">or</p>
          <hr />
        </div>
        <Link
          to={""}
          className="text-center text-blue-600 w-full flex justify-center font-serif"
        >
          Forgot password
        </Link>
        <div className="w-full font-bold">
          <hr className=""/>
          <p className=" mt-2 text-center">or</p>
          <hr />
        </div>
        <p className=" text-center mt-3 mb-5">
          Need an account?{" "}
          <Link to="/Signup" className="text-blue-500 font-bold underline">
            Create one
          </Link>
        </p>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
export default Login;
