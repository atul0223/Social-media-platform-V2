import User from "../models/user.model.js";
import isFollowed from "../utils/isFollowed.js";
import UserProfile from "../models/UserProfile.model.js";
import Post from "../models/posts.model.js";
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!username?.trim()) {
      return res.status(400).json({ message: "please provide username" });
    }

    const targetUser = await User.findOne({ username }).select(
      "-password -refreshToken -verificationEmailToken -isVerified -username"
    );
    if (!targetUser) {
      return res.status(404).json({ message: "user not exists" });
    }

    const sameUser = targetUser._id.toString() === user._id.toString();
    const isBlocked = user?.blockedUsers?.includes(targetUser._id) || false
   
    
   
    if (targetUser?.blockedUsers?.includes(user._id)) {
      return res.status(404).json({ message: "user not found" });
    }

    const followRelation = await UserProfile.findOne({
      profile: targetUser._id,
      follower: user._id,
    });

    let requestStatus = "follow";
    if (followRelation?.requestStatus === "accepted") requestStatus = "unfollow";
    else if (followRelation?.requestStatus === "pending") requestStatus = "requested";

  const userProfile = await User.aggregate([
  { $match: { username: username.trim() } },

  // Filtered followers: users who follow this profile and requestStatus is accepted
  {
    $lookup: {
      from: "userprofiles",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$profile", "$$userId"] },
                { $eq: ["$requestStatus", "accepted"] }
              ]
            }
          }
        }
      ],
      as: "followers"
    }
  },

  // Filtered following: users this profile follows and requestStatus is accepted
  {
    $lookup: {
      from: "userprofiles",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$follower", "$$userId"] },
                { $eq: ["$requestStatus", "accepted"] }
              ]
            }
          }
        }
      ],
      as: "following"
    }
  },

  {
    $addFields: {
      followersCount: { $size: "$followers" },
      followingCount: { $size: "$following" },
      isFollowing: {
        $in: [
          user._id,
          {
            $map: {
              input: "$followers",
              as: "f",
              in: "$$f.follower"
            }
          }
        ]
      }
    }
  },

  {
    $lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "publisher",
      as: "postList"
    }
  },

  {
    $addFields: {
      postsCount: { $size: "$postList" }
    }
  },

  {
    $project: {
      username: 1,
      followersCount: 1,
      followingCount: 1,
      isFollowing: 1,
      profilePic: 1,
      profilePrivate: 1,
      postsCount: 1
    }
  }
]);
    const profileDetails = userProfile[0];

    if (targetUser.profilePrivate && !(await isFollowed(targetUser._id, user._id)) && !sameUser) {
      return res.json({
        profileDetails,
        requestStatus,
        sameUser,
        isBlocked,
        isPrivate: true,
        posts: [],
      });
    }

    const userPosts = await Post.aggregate([
      { $match: { publisher: targetUser._id } },
      { $sort: { createdAt: -1 } },
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
            { $unwind: "$commenterDetails" },
            {
              $project: {
                _id: 1,
                comment: 1,
                commenterDetails: {
                  username: "$commenterDetails.username",
                  profilePic: "$commenterDetails.profilePic",
                },
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
          comments: "$comments",
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
    ]);

    return res.status(200).json({
      success: true,
      profileDetails,
      posts: userPosts,
      requestStatus,
      isBlocked,
      sameUser,
      isPrivate: false,
      page,
      limit,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
const toggleBlock = async (req, res) => {
  const { username } = req.params;
  const { block } = req.body;
  const user = req.user;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (typeof block !== "boolean") {
    return res.status(400).json({ message: "Invalid block flag provided" });
  }

  const userExists = await User.findOne({ username }).select(
    "-password -refreshToken -verificationEmailToken -isVerified -trustedDevices"
  );

  if (!userExists) {
    return res.status(404).json({ message: "User not found" });
  }

  const isBlocked = user.blockedUsers?.includes(userExists._id);

  if (block) {
    if (isBlocked) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    await UserProfile.deleteMany({
      follower: user._id,
      profile: userExists._id,
    });

    await User.findByIdAndUpdate(user._id, {
      $addToSet: { blockedUsers: userExists._id },
    });

    return res.status(200).json({ message: "Successfully blocked the user" });
  } else {
    if (!isBlocked) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    await User.findByIdAndUpdate(user._id, {
      $pull: { blockedUsers: userExists._id },
    });

    return res.status(200).json({ message: "Successfully unblocked the user" });
  }
};
const toggleFollow = async (req, res) => {
  const { username } = req.params;
  const { follow } = req.body;
  const userX = req.user; //user that is logged in
  if (!username) {
    return res.status(400).json({ message: "username is required" });
  }

  const user = await User.findOne({ username }); //user that we want to follow or unfollow
  if (!user || user.blockedUsers?.includes(userX?._id)) {
    return res.status(404).json({ message: "user not exists" });
  }
  if (userX.username === user.username) {
    return res
      .status(401)
      .json({ message: "can not follow/unfollow yourself" });
  }
  const alreadyFollowing = await UserProfile.findOne({
    follower: userX._id,
    profile: user._id,
    requestStatus: "accepted",
  });

  if (follow) {
    if (alreadyFollowing) {
      return res.status(401).json({ message: "already following" });
    }
    if (!user.profilePrivate) {
      await UserProfile.create({
        follower: userX._id,
        profile: user._id,
        requestStatus: "accepted",
      })
        .then(() => {
          res.status(200).json({
            message: "Followed successfully",
            success: true,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (user.profilePrivate) {
      await UserProfile.create({
        follower: userX._id,
        profile: user._id,
        requestStatus: "pending",
      })
        .then(() => {
          res.status(200).json({
            message: "request sent successfully",
            success: true,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ message: "internal server error" });
        });
    }
  } else if (!follow) {
    try {
      await UserProfile.findOneAndDelete({
        follower: userX._id,
        profile: user._id,
      });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({
      message: "Unfollowed successfully",
      success: true,
    });
  } else {
    return res.status(400).json({ message: "invalid action" });
  }
};
const getFollowerFollowingList = async (req, res) => {
  const { username } = req.params;
  const userX = req.user;
  const targetUser = await User.findOne({ username }).select(
    "-password -refreshToken -verificationEmailToken -isVerified -trustedDevices "
  );
  if (targetUser?.blockedUsers?.includes(userX._id)) {
    return res.status(404).json({message:"user not found"})
  }
  if (isFollowed(targetUser._id, userX._id) || (!targetUser.profilePrivate)) {
    const FolloweList = await User.aggregate([
      {
        $match: {
          username: username,
        },
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "_id",
          foreignField: "profile",
          as: "followerList",
        },
      },
      {
        $unwind: { path: "$followerList", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          let: { followerId: "$followerList.follower" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$followerId"] } } },
            {
              $project: {
                username: 1,
                profilePic: 1,
                _id: 1,
              },
            },
          ],
          as: "followerUser",
        },
      },
      {
        $unwind: {
          path: "$followerUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",

          followerList: { $push: "$followerUser" },
        },
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "_id",
          foreignField: "follower",
          as: "followingList",
        },
      },
      {
        $unwind: {
          path: "$followingList",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "users",
          let: { followingId: "$followingList.profile" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$followingId"] } } },
            {
              $project: {
                username: 1,
                profilePic: 1,
                _id: 1,
              },
            },
          ],
          as: "followingUser",
        },
      },
      {
        $unwind: {
          path: "$followingUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          followerList: { $first: "$followerList" },
          followingList: { $push: "$followingUser" },
        },
      },
      {
        $project: {
          _id: 0,
          followerList: 1,
          followingList: 1,
        },
      },
    ]);
    if (!FolloweList.length) {
     return res.status(404).json({message:"user not found"})
    }

    return res.status(200).json(FolloweList[0]);
  }
};
export { getUserProfile, toggleBlock, toggleFollow, getFollowerFollowingList };
