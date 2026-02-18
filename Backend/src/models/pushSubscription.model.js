import mongoose, { Schema } from "mongoose";

const pushSubscriptionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ user: 1, endpoint: 1 }, { unique: true });

const PushSubscription = mongoose.model(
  "PushSubscription",
  pushSubscriptionSchema
);
export default PushSubscription;
