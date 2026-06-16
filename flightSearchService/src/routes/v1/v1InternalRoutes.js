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
router.get(
  "/flights/:id",
  internalAuthMiddleware,
  flightController.fetchFlight,
);
/**
 * @swagger
 * /api/v1/internal/flights/{id}/seats:
 *   patch:
 *     summary: Update flight seats (Internal)
 *     tags: [Internal]
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flight ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - seatsToIncrement
 *                 properties:
 *                   seatsToIncrement:
 *                     type: integer
 *                     minimum: 1
 *               - type: object
 *                 required:
 *                   - seatsToDecrement
 *                 properties:
 *                   seatsToDecrement:
 *                     type: integer
 *                     minimum: 1
 *     responses:
 *       200:
 *         description: Seats updated
 */
router.patch(
  "/flights/:id/seats",
  internalAuthMiddleware,
  flightController.updateSeats,
);

module.exports = router;
