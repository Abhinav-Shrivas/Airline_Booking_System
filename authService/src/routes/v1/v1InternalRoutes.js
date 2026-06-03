const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const { internalAuthMiddleware } = require("shared");

/**
 * @swagger
 * /api/v1/internal/users/{id}:
 *   get:
 *     summary: Get user by ID (internal service-to-service)
 *     tags: [Internal]
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Invalid API key
 */
router.get("/users/:id", internalAuthMiddleware, userController.fetchUser);

module.exports = router;
