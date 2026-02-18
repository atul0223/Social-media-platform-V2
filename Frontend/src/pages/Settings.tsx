import { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";
import axios from "axios";
import { BACKENDURL } from "../config.js";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { Switch } from "@/components/ui/switch.js";

function Settings() {
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen4, setIsOpen4] = useState(false);
  const [isOpen5, setIsOpen5] = useState(false);
  const [isOpen6, setIsOpen6] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [message, setMessage] = useState("");
  const { fetchCurrentUser, currentUserDetails, setLoading, setTabOpen }: any =
    useContext(UserContext);
  const navigate = useNavigate();
  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.get(
        `${BACKENDURL}/user/logout`,

        { withCredentials: true }
      );
      localStorage.removeItem("currentUser");
      localStorage.removeItem("accessToken");
      delete (axios.defaults.headers.common as any).Authorization;
      navigate("/");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error changing username");
    } finally {
      setLoading(false);
    }
  };
  const handleChangeUsername = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BACKENDURL}/user/updateUsername`,
        { newUsername },
        { withCredentials: true }
      );

      setMessage("Username updated successfully");
      setNewUsername("");
      fetchCurrentUser();
    } catch (error: any) {
      console.error("Error changing username:", error);
      setMessage(error.response?.data?.message || "Error changing username");
    } finally {
      setLoading(false);
    }
  };
  const handleFullNameChange = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BACKENDURL}/user/changeFullName`,
        { newFullName: newFullName },
        { withCredentials: true }
      );
      setMessage("Full name updated successfully");
      setNewFullName("");
      fetchCurrentUser();
    } catch (error: any) {
      console.error("Error changing full name:", error);
      setMessage(error.response?.data?.message || "Error changing full name");
    } finally {
      setLoading(false);
    }
  };
  const handleEmailChange = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKENDURL}/user/changeEmail`,
        { newEmail: newEmail },
        { withCredentials: true }
      );

      setMessage(response.data.message);
      setNewEmail("");
      fetchCurrentUser();
    } catch (error: any) {
      console.error("Error changing email:", error);
      setMessage(error.response?.data?.message || "Error changing email");
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordChange = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BACKENDURL}/user/changePassword`,
        { newPassword: newPassword },
        { withCredentials: true }
      );
      setMessage("Password updated successfully");
      setNewPassword("");
      fetchCurrentUser();
    } catch (error: any) {
      console.error("Error changing password:", error);
      setMessage(error.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };
  const handleCheckUserAvailability = async (username: string) => {
    try {
      const res = await axios.get(
        `${BACKENDURL}/user/isUsernameAvailable/${username}`,
        {
          withCredentials: true,
        }
      );
      setMessage(res.data.message);
      if (!res.data.available) {
        setBtnDisabled(true);
      } else {
        setBtnDisabled(false);
      }
    } catch (error) {}
  };
  const handleProfileVisiblity = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BACKENDURL}/user/toggleProfileVisiblity`,
        { makePrivate: !currentUserDetails.profilePrivate },
        {
          withCredentials: true,
        }
      );
      console.log();

      fetchCurrentUser();
    } catch (error) {}

    setLoading(false);
  };
  const handleDeleteProfilePic = async () => {
    setLoading(true);
    try {
      await axios.delete(`${BACKENDURL}/user/deleteProfilePic`, {
        withCredentials: true,
      });
      fetchCurrentUser();
    } catch (error) {}
    setIsOpen1(false);
    setLoading(false);
  };
  const handleFileChange = async (e: any) => {
    setLoading(true);
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);

        const formData = new FormData();
        formData.append("newProfilePic", file);
        await axios.post(`${BACKENDURL}/user/changeProfilePic`, formData, {
          withCredentials: true,
        });
        fetchCurrentUser();
      } catch (error) {}
      setIsOpen1(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setTabOpen("settings");
    if (localStorage.getItem("currentUser") === null) {
      navigate("/");
    }
    fetchCurrentUser();
    setNewUsername(currentUserDetails?.username || "");
    setNewFullName(currentUserDetails?.fullName || "");
    setNewEmail(currentUserDetails?.email || "");
  }, []);
  return (
    <div className="max-w-screen min-h-screen bg-neutral-200 xl:pr-20 pl-4 pr-4 flex justify-center pb-20 sm:pb-0 ">
      <Loading />
      <div className="w-full h-full pb-3">
        <div className="w-full h-full mt-15 font-serif text-black">
          <div className="sm:flex">
            <div className="  w-full h-full sm:pt-20">
              <div className="w-full h-6 flex justify-center mb-2">
                <img
                  src={currentUserDetails?.profilePic || "/pic.jpg"}
                  className="object-cover w-45 h-45 md:h-60 md:w-60 rounded-full absolute"
                />

                <div>
                  {isOpen1 ? (
                    <div className="ml-45  mt-30 md:mt-50 ">
                      <img
                        src="close.png"
                        alt=""
                        className="absolute w-4 h-4 hover:w-5 hover:h-5 active:w-3 active:h-3  mt-4  "
                        onClick={() => {
                          setIsOpen1(!isOpen1);
                        }}
                      />
                      <img
                        src="delete.png"
                        alt=""
                        className="absolute w-6 h-6 hover:w-7 hover:h-7 active:w-5 active:h-5 z-10  ml-9 mb-9 "
                        onClick={() => {
                          setIsOpen1(!isOpen1);
                          handleDeleteProfilePic();
                        }}
                      />
                      <div>
                        <input
                          id="settings-profile-pic"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor="settings-profile-pic"
                          className="cursor-pointer"
                        >
                          <img
                            src="edit.png"
                            alt=""
                            className="absolute w-5 h-5 hover:w-6 hover:h-6 active:w-4 active:h-4 z-10 ml-10 mt-9"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <img
                      src="edit.png"
                      alt=""
                      className="absolute w-5 h-5 z-10 hover:w-4 hover:h-4 ml-23  mt-36 md:mt-50 "
                      onClick={() => {
                        setIsOpen1(!isOpen1);
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="w-full md:mt-60 mt-43">
                <div className="flex justify-center mb-1 mr-3">
                  <h5>@ {currentUserDetails?.username}</h5>
                </div>
                <div className="flex justify-center ">
                  <h5>
                    {"("}
                    {currentUserDetails?.fullName}
                    {")"}
                  </h5>
                </div>
              </div>
            </div>
            <div className="w-full h-full sm:mt-0  mt-3">
              <div className="bg-neutral-300 text-black rounded-2xl mb-1  hover:bg-neutral-400">
                <div
                  className="w-full h-20 p-4 items-center  cursor-pointer "
                  onClick={() => {
                    setIsOpen2(!isOpen2);
                  }}
                >
                  Change username
                </div>

                <div
                  className={`  pl-4 pr-4 pb-4 transition-all duration-300 ${
                    isOpen2
                      ? "max-h-96 opacity-100 block"
                      : "max-h-0 opacity-0 overflow-hidden hidden"
                  }`}
                >
                  <div className="input-group">
                    <div className="w-full flex justify-end">{message}</div>
                    <div className="flex">
                      <input
                        type="text"
                        className="bg-white rounded p-2 w-full border-orange-600 border-1 mr-3"
                        placeholder="New username"
                        aria-label="new username"
                        aria-describedby="button-addon2"
                       
                        onChange={(e) => {
                          setNewUsername(e.target.value);
                          handleCheckUserAvailability(e.target.value);
                        }}
                        value={newUsername}
                      />
                      <button
                        className="bg-orange-600 px-3 py-2 cursor-pointer rounded "
                        type="button"
                        id="button-addon2"
                        disabled={btnDisabled}
                        onClick={handleChangeUsername}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-300 text-black rounded-2xl mb-1  hover:bg-neutral-400">
                <div
                  className="w-full h-20 p-4 items-center  cursor-pointer"
                  onClick={() => {
                    setIsOpen3(!isOpen3);
                  }}
                >
                  Change Full Name
                </div>

                <div
                  className={`  pl-4 pr-4 pb-4  transition-all duration-300 ${
                    isOpen3
                      ? "max-h-96 opacity-100 block"
                      : "max-h-0 opacity-0 overflow-hidden hidden"
                  }`}
                >
                  <div className="input-group">
                    <div className="flex">
                      <input
                        type="text"
                        className="bg-white rounded p-2 w-11/12 border-orange-600 border-1 mr-3"
                        placeholder="New Fullname"
                        aria-label="New Full Name"
                        aria-describedby="button-addon3"
                       
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                      />
                      <button
                        className="bg-orange-600 px-3 py-2 cursor-pointer rounded "
                        type="button"
                        id="button-addon3"
                        onClick={handleFullNameChange}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-300 text-black rounded-2xl mb-1 hover:bg-neutral-400">
                <div
                  className="w-full h-20 p-4 items-center  cursor-pointer"
                  onClick={() => {
                    setIsOpen4(!isOpen4);
                  }}
                >
                  Change Email
                </div>

                <div
                  className={`pl-4 pr-4 pb-4 transition-all duration-300 ${
                    isOpen4
                      ? "max-h-96 opacity-100 block"
                      : "max-h-0 opacity-0 overflow-hidden hidden"
                  }`}
                >
                  <div className="input-group">
                    <div className="w-full flex justify-end">{message}</div>
                    <div className="flex">
                      <input
                        type="email"
                        className="bg-white rounded p-2 w-11/12 border-orange-600 border-1 mr-3"
                        placeholder="New email"
                        aria-label="New Email"
                        aria-describedby="button-addon4"
                       
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                      <button
                        className="bg-orange-600 px-3 py-2 cursor-pointer rounded "
                        type="button"
                        id="button-addon4"
                        onClick={handleEmailChange}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-300 text-black rounded-2xl mb-1 hover:bg-neutral-400">
                <div
                  className="w-full h-20 p-4 items-center  cursor-pointer"
                  onClick={() => {
                    setIsOpen5(!isOpen5);
                  }}
                >
                  Change Password
                </div>

                <div
                  className={`pl-4 pr-4 pb-4 transition-all duration-300 ${
                    isOpen5
                      ? "max-h-96 opacity-100 block"
                      : "max-h-0 opacity-0 overflow-hidden hidden"
                  }`}
                >
                  <div className="input-group mb-2">
                    <div className="flex">
                      <input
                        type="password"
                        className="bg-white rounded p-2 w-11/12 border-orange-600 border-1 mr-3"
                        placeholder="New Password"
                        aria-label="New Password"
                        aria-describedby="button-addon5"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        className="bg-orange-600 px-3 py-2 cursor-pointer rounded "
                        type="button"
                        id="button-addon5"
                        onClick={handlePasswordChange}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-300 text-black rounded-2xl  hover:bg-neutral-400">
                <div
                  className="w-full h-20 p-4 items-center  cursor-pointer"
                  onClick={() => {
                    setIsOpen6(!isOpen6);
                  }}
                >
                  Change Profile Visiblity
                </div>

                <div
                  className={`pl-4 pr-4 pb-4 transition-all duration-300  ${
                    isOpen6
                      ? "max-h-96 opacity-100 block"
                      : "max-h-0 opacity-0 overflow-hidden hidden"
                  } `}
                >
                  <div className="form-check form-switch flex ">
                    <Switch
                      className="cursor-pointer mr-2"
                      checked={currentUserDetails?.profilePrivate || false}
                      onClick={() => handleProfileVisiblity()}
                    />
                    <p className="-mt-0.5">
                      Current Status{" ("}
                      {currentUserDetails?.profilePrivate === true ? (
                        <>Private</>
                      ) : (
                        <>Public</>
                      )}
                      {")"}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="w-full h-20 p-4 items-center  cursor-pointer bg-neutral-300 rounded-2xl mt-1 text-red-700 hover:bg-neutral-400"
                onClick={() => {
                  handleLogout();
                }}
              >
                Logout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
