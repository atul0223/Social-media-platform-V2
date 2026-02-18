import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    passwordSchema: {
      password: {
        type: String,
        required: true,
      },
      attempts: {
        type: Number,
        default: 0, // Number of failed login attempts
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    profilePic: {
      type: String,
    },
    isVerified: { type: Boolean, default: false },
    fullName: {
      type: String,
      
      trim: true,
    },
    otp: {
      type: Number,
      default: 0,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    profilePrivate: {
      type: Boolean,
      default: false,
    },
    profileDeativation: {
      isDeactivated: {
        type: Boolean,
        default: false,
      },
      reason: { type: String, },
      reactivationTime: {
        type: Date,
      },
    },
  },{
    timestamps: true,
  }
);


const User = mongoose.model("User", userSchema);
export default User;
