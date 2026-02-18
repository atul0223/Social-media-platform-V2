import webpush from "web-push";
import PushSubscription from "../models/pushSubscription.model.js";

const getVapidConfig = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
};

const ensureVapid = () => {
  const config = getVapidConfig();
  if (!config) return null;
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return config;
};

const sendPushToUser = async (userId, payload) => {
  const config = ensureVapid();
  if (!config) return { sent: 0, skipped: true };

  const subscriptions = await PushSubscription.find({ user: userId }).lean();
  if (!subscriptions.length) {
    return { sent: 0, skipped: true };
  }

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (error) {
        const statusCode = error?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error("Push send error:", statusCode, error?.message || error);
        }
      }
    })
  );

  return { sent, skipped: false };
};

export { getVapidConfig, sendPushToUser };
