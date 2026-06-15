const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/notification.controller");
const { authMiddleware, authorizeMiddleware } = require("shared");

// GET /api/v1/notifications — user's own notification history
/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get your notification history
 *     tags: [Notifications]
 *     description: "Access: Any authenticated user (returns own SENT notifications)"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", authMiddleware, notificationController.getUserNotifications);

// GET /api/v1/notifications/user/:userId — admin fetches any user's notifications (all statuses)
/**
 * @swagger
 * /api/v1/notifications/user/{userId}:
 *   get:
 *     summary: Get any user's notifications (Admin only)
 *     tags: [Notifications]
 *     description: "Access: ADMIN only — returns all statuses (PENDING, SENT, FAILED)"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target user ID
 *     responses:
 *       200:
 *         description: List of notifications for the specified user
 *       403:
 *         description: Forbidden — Admin access required
 */
router.get(
  "/user/:userId",
  authMiddleware,
  authorizeMiddleware("ADMIN"),
  notificationController.getNotificationsByUserId,
);

module.exports = router;