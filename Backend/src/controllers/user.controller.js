import User from "../models/user.model.js";
import cloudinaryUpload from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import generateJWT from "../utils/jwtokengenerator.js";
import sendOtp from "../utils/sendOtp.js";
import UserProfile from "../models/UserProfile.model.js";
import mongoose from "mongoose";
import Post from "../models/posts.model.js";
const extractPublicId = (url) => {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (err) {
    console.error("Failed to extract public_id from URL:", url);
    return null;
  }
};
const signup = async (req, res) => {
  const { username, password, email, fullName } = req.body;
  if ([username, password, email].some((f) => !f?.trim())) {
    return res.status(401).json({ message: "fields required" });
  }
  const localFilePath = req.files?.profilePic?.[0]?.path;
  const existedUser = await User.findOne({ username });
  if (existedUser) {
    return res.status(401).json({ message: "Username already exists" });
  }
  const emailUsed = await User.findOne({ email });
  if (emailUsed) {
    return res.status(401).json({ message: "Email already exists" });
  }
  const profilePic = await cloudinaryUpload(localFilePath);
  
  const newUser = new User({
    username,
    passwordSchema: {
      password,
    },
    email,
    fullName,
    profilePic: profilePic?.secure_url,
 
  });

  sendOtp(email)

  return res.status(200).json({
    message: "Successfully registered" ,requiresOtp: true ,emailVerify:true
  });
};
const login = async (req, res) => {
  const { identifier , password, trustDevice } = req.body;
  if (identifier === null || password === null) {
    return res
      .status(401)
      .json({ message: "Username and password are required" });
  }
const user = await User.findOne({
  $or: [{ email: identifier }, { username: identifier }]
});
  if (!user) return res.status(404).json({ message: "User not found" });

  const validateUser = await user.validatePassword(password);
  if (!validateUser) {
    if (user.passwordSchema.attempts >= 5) {
      sendOtp(user.email);
      return res
        .status(429)
        .json({ message: "Too many wrong attempts.", requiresOtp: true });
    }
    user.passwordSchema.attempts += 1;
    await user.save({ validateBeforeSave: false });
    return res.status(401).json({ message: "Incorrect password" });
  }

  if (!user.isVerified) {
    const token = generateJWT(user._id, process.env.EMAILTIME);
    sendOtp(user.email)
  
    await user.save({ validateBeforeSave: false });
    return res.status(301).json({
      message: "Please verify your email",
      requiresOtp: true ,
      emailVerify:true
    });
  }

  user.passwordSchema.attempts = 0; // Reset attempts on successful login
  await user.save({ validateBeforeSave: false });
  const accessToken = generateJWT(user._id, trustDevice ? "30d" : "24h");
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: trustDevice ? 60 * 60 * 1000 * 24 * 30 : 60 * 60 * 1000 * 24,
  };

  return res.status(200).cookie("AccessToken", accessToken, options).json({
    message: "Successfully logged in",
  });
};
const logout = async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };
  res.clearCookie("AccessToken", options);
  return res.status(200).json({
    message: "Logout successful",
  });
};
const changeProfilepic = async (req, res) => {
  try {
    const newProfilepic = req.files?.newProfilePic?.[0]?.path;

    if (!newProfilepic) {
      return res.status(400).json({ message: "please provide new pic" });
    }
    const profilePic = await cloudinaryUpload(newProfilepic);
    if (!profilePic) {
      return res.status(500).json({ message: "internal server error" });
    }
    const publicId = extractPublicId(req.user?.profilePic);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
    
    req.user.profilePic = profilePic?.secure_url;
    await req.user.save({ validateBeforeSave: false });
    return res.status(200).json({
      message: "Profile picture updated successfully",
      profilePic: req.user.profilePic,
    });
  } catch (error) {
    console.error("Error in changeProfilepic:", error);
    return res.status(500).json({
      message: "Something went wrong while updating profile picture",
    });
  }
};
const deleteProfilePic = async (req, res) => {
  try {
    const publicId = extractPublicId(req.user.profilePic);

    await cloudinary.uploader.destroy(publicId);
    req.user.profilePic = "";

    await req.user.save({ validateBeforeSave: false });
    return res.status(200).json({
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProfilePic:", error);
    return res.status(500).json({
      message: "Something went wrong while deleting profile picture",
    });
  }
};
const updateUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    const user = req.user;
    if (newUsername === null || newUsername.trim() === "") {
      return res.status(400).json({ message: "new name can't empty" });
    }

    const UniqueUser = await User.findOne({ username: newUsername });
    if (UniqueUser) {
      return res.status(401).json({ message: "Username already exists" });
    }
    user.username = newUsername;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      message: "Username updated successfully",
    });
  } catch (error) {
    console.error("Error in updateUsername:", error);
    return res.status(500).json({
      message: "Something went wrong while updating username",
    });
  }
};
const changeFullName = async (req, res) => {
  const { newFullName } = req.body;
  const user = req.user;

  if (!newFullName || newFullName.trim() === "") {
    return res.status(400).json({ message: "fields required" });
  }
  user.fullName = newFullName;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json({
    message: "Full name updated successfully",
  });
};
const changePasswordIn = async (req, res) => {
  const { newPassword } = req.body;
  const user = req.user;

  if (!newPassword) {
    return res.status(400).json({
      message: "fields required",
    });
  }

  user.passwordSchema.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    message: "Password updated successfully",
  });
};
const forgetPassword = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ message: "identifier is required" });
  }
  
 const user = await User.findOne({
  $or: [{ email: identifier }, { username: identifier }]
});
  
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }sendOtp(user.email)
  return res.status(200).json({
    message: "otp sent successfully",
  });
};
const changeEmail = async (req, res) => {
  const { newEmail } = req.body;
  const user = req.user;
  const emailToken = generateJWT(user._id, process.env.EMAILTIME);
  if (!newEmail) {
    return res.status(400).json({
      message: "fields required",
    });
  }
  if (newEmail === user.email) {
    return res.status(200).json({
      message: "Email changed successfully",
    });
  }
  const emailUsed = await User.findOne({ email: newEmail });
  if (emailUsed) {
    return res.status(400).json({
      message: "Email already used",
    });
  }
  user.isVerified = false;
  user.email = newEmail;
  user.save({ validateBeforeSave: false });
 sendOtp(newEmail);
  res.status(200).json({
    message: "otp sent to new email",
    requiresOtp: true ,
    emailVerify:true
  });
};
const toggleProfileVisiblity = async (req, res) => {
  const user = req.user;

  const { makePrivate } = req.body;
  if (typeof makePrivate !== "boolean") {
    return res.status(400).json({ message: "Invalid value for makePrivate" });
  }

  if (makePrivate === true) {
    user.profilePrivate = true;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      message: "now profile is private",
    });
  } else if (makePrivate === false) {
    user.profilePrivate = false;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      message: "now profile is public",
    });
  }
};
const handleRequest = async (req, res) => {
  const user = req.user;
  const { doAccept } = req.body;
  const targetUser = req.params.targetUsername;

  const targetuser = await User.findOne({ username: targetUser });
  if (!targetuser) {
    return res.status(404).json({
      message: "user not found",
    });
  }

  const request = await UserProfile.findOne({
    profile: user._id,
    follower: targetuser._id,
    requestStatus: "pending",
  });

  if (!request) {
    return res.status(200).json({ message: "no requests" });
  }

  if (doAccept === false) {
    await UserProfile.findOneAndDelete({
      profile: user._id,
      follower: targetuser._id,
      requestStatus: "pending",
    });
    return res.status(200).json({ message: "request rejected" });
  }

  request.requestStatus = "accepted";
  await request.save({ validateBeforeSave: true });

  return res.status(200).json({ message: "request accepted" });
};

const verifyOtp = async (req, res) => {
  const { identifier, otp, trustDevice ,emailVerify } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: "please provide unique credential" });
  }
 const user = await User.findOne({
  $or: [{ email: identifier }, { username: identifier }]
});
  
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  if (!otp) {
    return res.status(400).json({ message: "otp is required" });
  }
  if (otp.length !== 6) {
    return res.status(400).json({ message: "otp must be 6 digits" });
  }
  if (user.otp.toString() !== otp.toString()) {
    return res.status(400).json({ message: "invalid otp" });
  }

  const accessToken = generateJWT(user._id, trustDevice ? "30d" : "1d");
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: trustDevice ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  };

  user.otp = null;
  user.passwordSchema.attempts = 0; // Reset attempts on successful login
  if(emailVerify) user.isVerified=true
  await user.save({ validateBeforeSave: false });
  return res.status(200).cookie("AccessToken", accessToken, options).json({
    message: "Successfully logged in",
  });
};

const getNotifications = async (req, res) => {
  const user = req.user;
  const data = await UserProfile.aggregate([
    {
      $match: {
        profile: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "follower",
        foreignField: "_id",
        as: "requester",
      },
    },
    {
      $unwind: {
        path: "$requester",

        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        requestStatus: 1,
        "requester.username": 1,
        "requester.profilePic": 1,
        createdAt: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json({ message: "fetched successfully", notifications: data });
};

const homePage = async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const hasFollowing = await UserProfile.exists({
      follower: user?._id,
      requestStatus: "accepted",
    });

    const commonPipeline = [
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "publisher",
          foreignField: "_id",
          as: "publisherDetails",
        },
      },
      { $unwind: "$publisherDetails" },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { postId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$post", "$$postId"] } } },
            {
              $lookup: {
                from: "users",
                localField: "commenter",
                foreignField: "_id",
                as: "commenterDetails",
              },
            },
           
          ],
          as: "comments",
        },
      },
      {
        $addFields: {
          currentUserId: user._id,
        },
      },
      {
        $project: {
          _id: 0,
          postDetails: {
            _id: "$_id",
            content: "$content",
            title: "$title",
            description: "$description",
          },
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          publisherDetails: {
            username: "$publisherDetails.username",
            profilePic: "$publisherDetails.profilePic",
          },
          isLiked: {
            $in: [
              "$currentUserId",
              {
                $map: {
                  input: "$likes",
                  as: "like",
                  in: "$$like.likedBy",
                },
              },
            ],
          },
        },
      },
    ];

    let feedPosts;

    if (hasFollowing) {
     const userFeed = await User.aggregate([
  { $match: { username: user.username } },
  {
    $lookup: {
      from: "userprofiles",
      localField: "_id",
      foreignField: "follower",
      as: "following",
    },
  },
  {
    $addFields: {
      following: {
        $filter: {
          input: "$following",
          as: "f",
          cond: { $eq: ["$$f.requestStatus", "accepted"] },
        },
      },
    },
  },
  {
    $lookup: {
      from: "posts",
      localField: "following.profile",
      foreignField: "publisher",
      as: "postList",
    },
  },
  {
    $set: {
      postList: {
        $sortArray: {
          input: "$postList",
          sortBy: { createdAt: -1 },
        },
      },
    },
  },
  { $unwind: { path: "$postList", preserveNullAndEmptyArrays: true } },
  { $match: { postList: { $type: "object" } } },
  { $replaceRoot: { newRoot: "$postList" } },
  ...commonPipeline,
]);
      feedPosts = userFeed;
    } else {
      feedPosts = await Post.aggregate([
        { $sort: { createdAt: -1 } },
        ...commonPipeline,
      ]);
    }

    return res.status(200).json({
      success: true,
      feedPosts,
      page,
      limit,
      message: hasFollowing
        ? "Showing posts from followed users"
        : "No following found, showing random posts",
    });
  } catch (error) {
    console.error("Error in homePage controller:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
export {
  signup,
  login,
  logout,
  changeProfilepic,
  deleteProfilePic,
  updateUsername,
  changeFullName,
  changePasswordIn,
  forgetPassword,
  changeEmail,
  toggleProfileVisiblity,
  handleRequest,
  verifyOtp,
  getNotifications,
  homePage,
};
