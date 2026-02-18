import Router from "express";
import verifyUser from "../middleware/auth.middleware.js";
import { homePage } from "../controllers/user.controller.js";
import User from "../models/user.model.js";
import {
  getNotifications,
  markAllRead,
  markRead,
} from "../controllers/notification.controller.js";
import Post from "../models/posts.model.js";
const router = Router();

router.route("/").get(verifyUser, homePage);
router.route("/search").get(verifyUser, async (req, res) => {
 const { query, searchType } = req.query;
  const auser = req.user;
  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }
  if (!searchType || (searchType !== "users" && searchType !== "posts")) {
    return res
      .status(400)
      .json({
        message:
          "searchType parameter is required and should be either 'users' or 'posts'",
      });
  }
  if (searchType === "users") {
    try {
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { fullName: { $regex: query, $options: "i" } },
        ],
      })
        .find({ username: { $ne: auser.username } })
        .select("username _id email profilePic fullName");

      return res.status(200).json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", Error: error });
    }
  } else if (searchType === "posts") {
    const posts = await Post.aggregate([
      { $match: { $or: [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }] } },
      { $sort: { createdAt: -1 } },
     
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
          currentUserId: auser._id,
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
                  in: "$$like.liker",
                },
              },
            ],
          },
        },
      },
    ]);
     return res.status(200).json(posts);
  }
});
router.route("/notifications").get(verifyUser, getNotifications);
router.route("/Notifications").get(verifyUser, getNotifications);
router.route("/notifications/read").post(verifyUser, markAllRead);
router.route("/notifications/:id/read").post(verifyUser, markRead);
export default router;
