const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/notification.controller");
const { authMiddleware } = require("shared");

// GET /api/v1/notifications — user's notification history
/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get user's notification history
 *     tags: [Notifications]
 *     description: "Access: Any authenticated user (returns own notifications)"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", authMiddleware, notificationController.getUserNotifications);

module.exports = router;