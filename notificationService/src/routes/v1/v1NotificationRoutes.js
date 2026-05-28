const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/notification.controller");
const { authMiddleware } = require("shared");

// GET /api/v1/notifications — user's notification history
router.get("/", authMiddleware, notificationController.getUserNotifications);

module.exports = router;