import { BACKENDURL } from "@/config";
import UserContext from "@/context/UserContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { Button } from "./ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision";
import FloatingInput from "./FloatingInput";

export default function OtpComponent({
  identifier,
  setOtpSend,
  emailVerify
}: {
  identifier: string;
    setOtpSend: (value: boolean) => void;
    emailVerify?:boolean
}) {
  const { loading, setLoading,fetchCurrentUser }: any = useContext(UserContext);
  const [otp, setOtp] = useState("");
  const [trustDevice, setTruestDevice] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await axios
      .post(
        `${BACKENDURL}/user/verifyotp`,
        { identifier, otp, trustDevice ,emailVerify },
        { withCredentials: true }
      )
      .then(async () => {
        setLoading(false);
        const user = await fetchCurrentUser();
        if (user) {
          navigate("/homepage");
        } else {
          setError("OTP verified, but session was not saved in this wrapper.");
        }
      })
      .catch((_error) => {
        setLoading(false);
        setError(_error.response?.data?.message);
        if (_error.response?.data.requiresOtp) {
          navigate("/signup");
        }
      });
  };
  const getUser = async () => {
    setLoading(true);
    await axios
      .get(`${BACKENDURL}/user/getUser`, { withCredentials: true })
      .then(() => {
        navigate("/homepage");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    getUser();
  }, []);
  return (
    <div
      className={`w-screen min-h-screen flex justify-center items-center bg-neutral-300 ${
        loading ? "opacity-75" : ""
      }`}
    >
      <Loading />
      <BackgroundBeamsWithCollision className=" lg:w-1/3 sm:w-2/3 md:w-1/2 mb-10 sm:mb-0 h-2/3 w-11/12 shadow-2xl bg-neutral-200 rounded-2xl p-4 shadow-black overflow-hidden">
        <div>
          <h1 className="text-2xl text-center">Otp send !</h1>{" "}
          <div className="w-full flex justify-center">
           <DotLottieReact
      src="https://lottie.host/e16fb81b-4fb7-4a83-92e0-ed80c9155b2d/gCmA2YwQfw.lottie"
      loop
      autoplay
      className="w-35 h-35"
    />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="">
          <div>
            <FloatingInput
              type="number"
              label="Otp"
              value={otp}
              error={error}
              onChange={setOtp}
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
          </div>

          <Button
            className="w-full mt-2"
            type="submit"
            disabled={loading || !identifier}
          >
            Login
          </Button>
        </form>
        <div className="w-full font-bold">
          <hr />
          <p className=" mt-3 text-center">or</p>
          <hr />
        </div>

        <div className="flex gap-2 justify-center">
          <h3 className=" text-center mt-2 cursor-pointer">Not you? </h3>
          <p
            className="text-blue-500 font-bold underline mt-2 cursor-pointer"
            onClick={() => setOtpSend(false)}
          >
            use another account
          </p>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
