import Notification from "../models/notification.model.js";
import { sendPushToUser } from "./push.js";

const buildPushPayload = ({ title, body, url }) => ({
  title,
  body,
  data: { url },
});

const createNotification = async ({
  recipientId,
  actorId,
  type,
  message,
  preview,
  target,
  url,
  title,
}) => {
  if (!recipientId || !actorId) return null;
  if (recipientId.toString() === actorId.toString()) {
    return null;
  }

  const notification = await Notification.create({
    recipient: recipientId,
    actor: actorId,
    type,
    message: message || "",
    preview: preview || "",
    target: target || {},
  });

  const payload = buildPushPayload({
    title: title || "New notification",
    body: message || preview || "",
    url: url || "/",
  });

  await sendPushToUser(recipientId, payload);

  return notification;
};

export { createNotification };
