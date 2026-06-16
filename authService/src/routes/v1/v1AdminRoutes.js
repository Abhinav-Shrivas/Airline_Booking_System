const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin.controller");
const {
  authMiddleware,
  authorizeMiddleware
} = require("../../middlewares/index");

/**
 * @swagger
 * /api/v1/admin/assignRole:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [Admin]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - roleName
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               roleName:
 *                 type: string
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Role assigned successfully
 */
router.post("/assignRole",authMiddleware, authorizeMiddleware("ADMIN"), adminController.assignRole);
/**
 * @swagger
 * /api/v1/admin/updateRole:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     description: "Access: ADMIN only. Replaces all existing roles with the specified one."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - roleName
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               roleName:
 *                 type: string
 *                 example: USER
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.patch("/updateRole",authMiddleware, authorizeMiddleware("ADMIN"), adminController.updateRole);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/users", authMiddleware, authorizeMiddleware("ADMIN"), adminController.getAllUsers);

module.exports = router;