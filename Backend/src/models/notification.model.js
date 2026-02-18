import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "like",
        "comment",
        "follow",
        "follow_request",
        "follow_accept",
        "message",
      ],
      required: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    preview: {
      type: String,
      default: "",
      trim: true,
    },
    target: {
      postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
      commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
      chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
