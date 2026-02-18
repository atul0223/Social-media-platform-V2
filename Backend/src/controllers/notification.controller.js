import Notification from "../models/notification.model.js";

const getNotifications = async (req, res) => {
  const user = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("actor", "username profilePic")
    .lean();

  const unreadCount = await Notification.countDocuments({
    recipient: user._id,
    isRead: false,
  });

  return res.status(200).json({
    message: "fetched successfully",
    notifications,
    unreadCount,
    page,
    limit,
  });
};

const markAllRead = async (req, res) => {
  const user = req.user;
  await Notification.updateMany(
    { recipient: user._id, isRead: false },
    { $set: { isRead: true } }
  );
  return res.status(200).json({ message: "all notifications marked read" });
};

const markRead = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "notification id required" });
  }
  await Notification.updateOne(
    { _id: id, recipient: user._id },
    { $set: { isRead: true } }
  );
  return res.status(200).json({ message: "notification marked read" });
};

export { getNotifications, markAllRead, markRead };
