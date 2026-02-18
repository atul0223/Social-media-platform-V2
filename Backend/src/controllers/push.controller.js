import PushSubscription from "../models/pushSubscription.model.js";
import { getVapidConfig } from "../utils/push.js";

const getVapidPublicKey = async (req, res) => {
  const config = getVapidConfig();
  if (!config) {
    return res.status(200).json({ publicKey: "" });
  }
  return res.status(200).json({ publicKey: config.publicKey });
};

const subscribe = async (req, res) => {
  const user = req.user;
  const { subscription, userAgent } = req.body || {};

  if (!subscription?.endpoint || !subscription?.keys?.p256dh) {
    return res.status(400).json({ message: "invalid subscription" });
  }

  await PushSubscription.updateOne(
    { user: user._id, endpoint: subscription.endpoint },
    {
      $set: {
        keys: subscription.keys,
        userAgent: userAgent || "",
      },
    },
    { upsert: true }
  );

  return res.status(200).json({ message: "subscribed" });
};

const unsubscribe = async (req, res) => {
  const user = req.user;
  const { endpoint } = req.body || {};
  if (!endpoint) {
    return res.status(400).json({ message: "endpoint required" });
  }

  await PushSubscription.deleteOne({ user: user._id, endpoint });
  return res.status(200).json({ message: "unsubscribed" });
};

export { getVapidPublicKey, subscribe, unsubscribe };
