const NotificationService = require("../services/notification.service");
const { asyncHandler, successResponse } = require("shared");

const getUserNotifications = asyncHandler(async (req, res) => {
  const data = await NotificationService.getNotificationsByUser(req.jwtPayload.userId);
  successResponse(res, { data, message: "Notifications fetched successfully." });
});

module.exports = { getUserNotifications };