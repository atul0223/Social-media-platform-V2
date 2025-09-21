import FloatingInput from "@/components/FloatingInput";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import UserContext from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { BACKENDURL } from "@/config";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";
import axios from "axios";
import OtpComponent from "@/components/OtpComponent";

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const { loading, setLoading }: any = useContext(UserContext);
  const [previewPic, setPreviewPic] = useState("");
  const [selectedPic, setSelectedPic] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const[otpPageOpen,setOtpPageOpen] =useState(false)
  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };
  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      setError(""); // Clear error when user types
    };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email); // stringify array
    formData.append("password", password);
    formData.append("profilePic", selectedPic);
    const res = await axios
      .post(`${BACKENDURL}/user/signup`, formData, { withCredentials: true })
      .then(() => {
        setLoading(false);
        setOtpPageOpen(true)
        // navigate("/verifyEmail");
      })
      .catch((_error) => {
        setLoading(false);
        setError(_error.response?.data?.message);
      });
    console.log(res);
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
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPic(file);
      setPreviewPic(URL.createObjectURL(file)); // create preview URL
    }
  };
  if (otpPageOpen) {
    return (<OtpComponent identifier={email} setOtpSend={setOtpPageOpen} emailVerify={true}/>)
  }
  else return (
    <div
      className={`w-screen min-h-screen flex justify-center items-center bg-neutral-300 ${
        loading ? "opacity-75" : ""
      }`}
    >
      <Loading />
      <BackgroundBeamsWithCollision className=" lg:w-1/3 sm:w-2/3 md:w-1/2  w-11/12 h-full shadow-2xl bg-neutral-200 rounded-2xl p-4 shadow-black overflow-hidden pt-8 ">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-3">
            <img
              src={previewPic || "/pic.jpg"}
              alt="Group Preview"
              className="object-cover w-30 h-30 rounded-full bg-gray-700 mb-3"
            />
            <div className="mt-23 " onClick={handlePickPhoto}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <img
                src="edit.png"
                alt="Edit"
                className="absolute w-4 h-4 hover:w-5 hover:h-5 active:w-3 active:h-3 z-10"
              />
            </div>
          </div>
          <FloatingInput
            type="text"
            label="Username"
            value={username}
            onChange={handleChange(setUsername)}
            error={error}
            readOnly={loading}
          />

          <FloatingInput
            type="email"
            label="Email"
            value={email}
            onChange={handleChange(setEmail)}
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
          <FloatingInput
            type="text"
            label="Confirm Password"
            value={confirmpass}
            onChange={handleChange(setConfirmPass)}
            error={error}
            readOnly={loading}
          />
          <input
            type="checkbox"
            id="trustDevice"
            defaultChecked
            readOnly={loading}
            className="m-2"
          />
          <label htmlFor="trustDevice">
            Accept our{" "}
            <Link to={"/"} className="text-blue-700">
              terms & conditions
            </Link>
          </label>
          <Button
            className="w-full mt-4 cursor-pointer"
            type="submit"
            disabled={loading || password!==confirmpass || [username,password,confirmpass,email].some(f=>f.trim()==="")}
          >
            Sign up
          </Button>
        </form>
        <div className="w-full font-bold">
          <hr className="" />
          <p className=" mt-2 text-center">or</p>
          <hr />
        </div>
        <p className=" text-center  mb-8">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 font-bold underline ">
            login
          </Link>
        </p>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
export default Signup;
