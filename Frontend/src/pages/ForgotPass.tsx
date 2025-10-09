import FloatingInput from "@/components/FloatingInput";
import Loading from "@/components/Loading";
import OtpComponent from "@/components/OtpComponent";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Button } from "@/components/ui/button";
import { BACKENDURL } from "@/config";
import UserContext from "@/context/UserContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
//import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPass() {
  const { loading, setLoading }: any = useContext(UserContext);
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [otpSend, setOtpSend] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await axios
            .post(
              `${BACKENDURL}/user/forgetPassword`,
              { identifier },
              { withCredentials: true }
            )
            .then(() => {
              setLoading(false);
              setOtpSend(true)
            })
            .catch((_error) => {
              setLoading(false);
              setError(_error.response?.data?.message);
              if (_error.response?.data.requiresOtp) {
                navigate("/signup");
              }
            });
    }
  
if (otpSend) {
  return <OtpComponent identifier={identifier} setOtpSend={setOtpSend} emailVerify={true}/>
}
else return (
    <div
      className={`w-screen min-h-screen flex justify-center items-center bg-neutral-300 ${
        loading ? "opacity-75" : ""
      }`}
    >
      <Loading />
      <BackgroundBeamsWithCollision className=" lg:w-1/3 sm:w-2/3 md:w-1/2 mb-10 sm:mb-0 h-2/3 w-11/12 shadow-2xl bg-neutral-200 rounded-2xl p-4 shadow-black overflow-hidden">
       
          <div>
            <h1 className="text-3xl font-serif text-center text-shadow-2xs">
              Forgot password?
            </h1>
            <h2 className="text-center">
              Enter your unique credentials (Username / Email)
            </h2>
            <h3 className="text-center">We'll send otp to registerd email.</h3>
            <div className="w-full flex justify-center mt-5 mb-5">
              {" "}
              <DotLottieReact
               src="https://lottie.host/d1facc19-6364-4e7a-8d78-e325d0e427d2/pYqin2oHdy.lottie"
                 loop
                autoplay
                className="w-30 h-30 rounded-full bg-gray-500"
              />
            </div>
          </div>
     
        <form onSubmit={handleSubmit} className="">
         
            <FloatingInput
              type="text"
              label="Username or Email"
              value={identifier}
              error={error}
              onChange={setIdentifier}
              readOnly={loading}
            />
         
          <Button className="w-full mt-2" type="submit" disabled={loading ||!identifier}>
           Next
          </Button>
        </form>
        <div className="w-full font-bold">
          <hr />
          <p className=" mt-3 text-center">or</p>
          <hr />
        </div>
       
          <p className=" text-center mt-3 mb-3">
            Need an account?{" "}
            <Link to="/Signup" className="text-blue-500 font-bold underline">
              Create one
            </Link>
          </p>
       
      </BackgroundBeamsWithCollision>
    </div>
  );
}
