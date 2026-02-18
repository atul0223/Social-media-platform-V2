import FloatingInput from "@/components/FloatingInput";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import UserContext from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { BACKENDURL } from "@/config";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import OtpComponent from "@/components/OtpComponent";

function Login() {
  let emailVerify;
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [trustDevice, setTruestDevice] = useState(true);
  const [error, setError] = useState("");
  const { loading, setLoading, fetchCurrentUser }: any =
    useContext(UserContext);
  const [OtpNeeded, setOtpNeeded] = useState(false);
  const getUser = async () => {
    setLoading(true);
    const user = await fetchCurrentUser();
    if (user) {
      navigate("/homepage");
    }
    setLoading(false);
  };
  useEffect(() => {
    getUser();
  }, []);
  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      setError(""); // Clear error when user types
    };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await axios
      .post(
        `${BACKENDURL}/user/login`,
        { identifier, password, trustDevice },
        { withCredentials: true }
      )
      .then(async (response) => {
        const token = response.data?.accessToken;
        if (token) {
          localStorage.setItem("accessToken", token);
          axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        setLoading(false);
        const user = await fetchCurrentUser();
        if (user) {
          navigate("/homepage");
        } else {
          setError("Login succeeded, but session was not saved in this wrapper.");
        }
      })
      .catch((_error) => {
        setLoading(false);
        setError(_error.response?.data?.message);
        emailVerify = _error.response?.data.emailVerify;
        if (_error.response?.data.requiresOtp) {
          setOtpNeeded(true);
        }
      });
  };

  if (OtpNeeded) {
    return (
      <OtpComponent
        identifier={identifier}
        setOtpSend={setOtpNeeded}
        emailVerify={emailVerify}
      />
    );
  } else
    return (
      <div
        className={`w-screen min-h-screen flex justify-center items-center bg-neutral-300 ${
          loading ? "opacity-75" : ""
        }`}
      >
        <Loading />
        <BackgroundBeamsWithCollision className=" lg:w-1/3 sm:w-2/3 md:w-1/2 mb-10 sm:mb-0 h-2/3 w-11/12 shadow-2xl bg-neutral-200 rounded-2xl p-4 shadow-black overflow-hidden   ">
          <h1 className="text-3xl font-serif text-center text-shadow-2xs">
            Welcome back !
          </h1>
          <div className="w-full flex justify-center mt-3">
            <DotLottieReact
              src="https://lottie.host/b4ec3d9b-f143-4e97-ad35-afdac8ab220b/qTHTDULUb4.lottie"
              loop
              autoplay
              className="w-30 h-30 mb-4 rounded-full bg-neutral-400"
            />
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <FloatingInput
              type="text"
              label="Username or Email"
              value={identifier}
              onChange={handleChange(setIdentifier)}
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
            <Button
              className="w-full mt-4"
              type="submit"
              disabled={loading || password === "" || identifier === ""}
            >
              Login
            </Button>
          </form>
          <div className="w-full font-bold">
            <hr />
            <p className=" mt-2 mb-2 text-center">or</p>
            <hr />
          </div>
          <h3 className="text-center  w-full flex justify-center font-serif ">
            {" "}
            Forgot password?
            <Link
              to={"/forgotPassword"}
              className="text-blue-600 underline ml-1"
            >
              Use otp
            </Link>
          </h3>
          <div className="w-full font-bold">
            <hr className="" />
            <p className=" mt-2 text-center">or</p>
            <hr />
          </div>
          <p className=" text-center mt-3 mb-5 sm:mb-0">
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
