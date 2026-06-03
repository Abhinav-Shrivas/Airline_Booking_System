const express = require("express");
const router = express.Router();
const flightController = require("../../controllers/flight.controller");
const { internalAuthMiddleware } = require("shared");

/**
 * @swagger
 * /api/v1/internal/flights/{id}:
 *   get:
 *     summary: Get flight by ID (Internal)
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
 *         description: Flight details
 */
router.get("/flights/:id", internalAuthMiddleware, flightController.fetchFlight);

module.exports = router;
