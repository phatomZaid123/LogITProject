import Notification from "../models/notification.js";
import User from "../models/user.js";

const cleanPayload = (payload = {}) => ({
  type: payload.type || "general",
  title: payload.title || "Notification",
  message: payload.message || "You have a new update.",
  link: payload.link || "",
  data: payload.data || {},
});

export const createNotification = async ({
  recipient,
  recipientRole,
  type,
  title,
  message,
  link,
  data,
}) => {
  if (!recipient || !recipientRole) return null;

  return Notification.create({
    recipient,
    recipientRole,
    ...cleanPayload({ type, title, message, link, data }),
  });
};

export const createNotificationsForRole = async (role, payload = {}) => {
  if (!role) return [];

  const users = await User.find({ role }).select("_id role").lean();
  if (!users.length) return [];

  const base = cleanPayload(payload);
  const docs = users.map((user) => ({
    recipient: user._id,
    recipientRole: user.role,
    ...base,
  }));

  return Notification.insertMany(docs);
};
