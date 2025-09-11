import mongoose, { Schema } from "mongoose";
const postSchema = new Schema(
  {
    title: {
      type: String,
      default: () => new Date().toString(),
    },
    description :{
      type:String,
    },
    content: {
      type: String,
      required: true,
    },
    publisher: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Post = mongoose.model("Post", postSchema);
export default Post;
