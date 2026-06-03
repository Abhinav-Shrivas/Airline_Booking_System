const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const {
  authMiddleware,
  authorizeMiddleware,
  attemptLimiter
} = require("../../middlewares/index");

/**
 * @swagger
 * /api/v1/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     description: "Access: Any authenticated user (changes own password)"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post("/change-password",attemptLimiter, authMiddleware, userController.changePassword);
/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/:id", authMiddleware, authorizeMiddleware("ADMIN"), userController.deleteUser);
/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 *     description: "Access: Own profile or ADMIN"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch("/:id", authMiddleware, userController.updateUser);
/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Fetch a user by ID
 *     tags: [Users]
 *     description: "Access: Own profile or ADMIN"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 */
router.get("/:id", authMiddleware, userController.fetchUser);

module.exports = router;
