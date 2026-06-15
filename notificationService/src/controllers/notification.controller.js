const NotificationService = require("../services/notification.service");
const { asyncHandler, successResponse } = require("shared");

const getUserNotifications = asyncHandler(async (req, res) => {
  const { userId, roles } = req.jwtPayload;
  const data = await NotificationService.getNotificationsByUser(userId, roles);
  successResponse(res, { data, message: "Notifications fetched successfully." });
});

// Admin-only: fetch any user's notifications (all statuses)
const getNotificationsByUserId = asyncHandler(async (req, res) => {
  const targetUserId = parseInt(req.params.userId, 10);
  const data = await NotificationService.getNotificationsByUser(targetUserId, ["ADMIN"]);
  successResponse(res, { data, message: "Notifications fetched successfully." });
});

module.exports = { getUserNotifications, getNotificationsByUserId };