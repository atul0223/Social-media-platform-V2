import mongoose from "mongoose";
import Post from "../models/posts.model.js";
import cloudinayUpload from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import Like from "../models/likes.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comments.model.js";

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
const newPosts = async (req, res) => {
  const userX = req.user;
  const { title, description } = req.body;

  const localFilePath = req.files?.post?.[0]?.path;
  if (!localFilePath) {
    return res.status(401).json({ message: "please provide a picture" });
  }
  const upload = await cloudinayUpload(localFilePath);
  if (!upload) {
    return res.status(500).json({ message: "error while uploading pic" });
  }
  const post = await Post.create({
    title: title || Date.now(),
    description,
    post: upload?.secure_url,
    publisher: userX,
  });
  return res.status(200).json({
    message: "successfully posted",
  });
};
const deletePost = async (req, res) => {
  const user = req.user;
  const postId = new mongoose.Types.ObjectId(req.params.postid);

  const selectedPost = await Post.findById(postId);
  if (!selectedPost) return res.status(404).json({ message: "post not found" });

  if (selectedPost.publisher.toString() !== user._id.toString()) {
    return res.status(403).json({ message: "not authorized for this action" });
  }

  const publicId = extractPublicId(selectedPost.post);

  const deleted = await Post.findOneAndDelete({ _id: postId });
  if (!deleted)
    return res.status(500).json({ message: "error while deleting post" });

  await cloudinary.uploader.destroy(publicId);

  return res.status(200).json({ message: "Successfully deleted post" });
};
const toggleLike = async (req, res) => {
  const { like } = req.body;
  const user = req.user;
  const { postId } = req.params;

  if (!postId) {
    return res.status(404).json({ message: "post not found" });
  }
  const postExists = await Post.findById(postId);
  if (!postExists) {
    return res.status(404).json({ message: "post not found" });
  }
  const targetUser = await User.findById(postExists.publisher).select(
    "blockedUsers"
  );

  if (targetUser?.blockedUsers?.includes(user._id)) {
    return res.status(404).json({ message: "post not found" });
  }
  if (like === true) {
    const alreadyLiked = await Like.findOne({ post: postId, likedBy: user });

    if (alreadyLiked) {
      return res.status(200).json({ message: "Already liked" });
    } else {
      const likee = await Like.create({
        post: postExists._id,
        likedBy: user._id,
      });
      return res.status(200).json({
        message: "successfully liked",
      });
    }
  } else {
    const alreadyLiked = await Like.findOne({ post: postId, likedBy: user });

    if (!alreadyLiked) {
      return res.status(200).json({ message: "Already unliked" });
    } else {
      await Like.findOneAndDelete({
        post: postExists._id,
        likedBy: user._id,
      });
      return res.status(200).json({
        message: "successfully unliked",
      });
    }
  }
};
const addComment = async (req, res) => {
  const { inputComment } = req.body;
  const { postId } = req.params;
  const user = req.user;

  if (!postId) {
    return res.status(404).json({ message: "post not found" });
  }
  if (!inputComment || inputComment.trim() === null) {
    return res.status(400).json({ message: "Empty comment" });
  }
  const postExists = await Post.findById(postId);
  const isBlocked = await User.findById(postExists.publisher).select(
    "blockedUsers"
  );

  if (isBlocked?.blockedUsers?.includes(user._id)) {
    return res.status(404).json({ message: "post not found" });
  }
  if (!postExists) {
    return res.status(404).json({ message: "post not found" });
  }
  const createComment = await Comment.create({
    post: postId,
    commenter: user,
    comment: inputComment,
  });
  if (!createComment)
    return res.status(500).json({ message: "error while creating a comment" });
  return res.status(200).json({
    message: "successfully commented",
    comment: createComment.comment,
  });
};

const deleteComments = async (req, res) => {
  const commentId = req.params.commentId;

  const user = req.user;

  if (!commentId) {
    return res.status(404).json({ message: "comment not found" });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "comment not found" });
  }

  if (comment.commenter.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this comment" });
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json({
    message: "Comment deleted successfully",
  });
};
const getSinglePost =async (req, res) => {
  const { postId } = req.params;
  const user = req.user;
  const post = await Post.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(postId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "publisher",
        foreignField: "_id",
        as: "publisherDetails",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        let: { postId: new mongoose.Types.ObjectId(postId) },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$post", "$$postId"] },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
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
        commentsCount: {
          $size: "$comments",
        },
      },
    },
    {
      $unwind: {
        path: "$publisherDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "publisherDetails.username": 1,
        "publisherDetails.profilePic": 1,
        comments: 1,
        likesCount: 1,
        commentsCount: 1,
        post: 1,
        title: 1,
      },
    },
  ]);
  console.log(post[0]);

  res.status(200).json({ post: post[0] });
}
export { newPosts, deletePost, toggleLike, addComment, deleteComments ,getSinglePost};
