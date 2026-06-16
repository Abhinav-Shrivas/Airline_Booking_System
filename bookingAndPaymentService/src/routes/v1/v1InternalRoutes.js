const express = require("express");
const router = express.Router();
const internalController = require("../../controllers/internal.controller");
const { internalAuthMiddleware } = require("shared");

// GET /api/v1/internal/bookings/upcoming?hoursUntilDeparture=24
/**
 * @swagger
 * /api/v1/internal/bookings/upcoming:
 *   get:
 *     summary: Get upcoming bookings
 *     tags: [Internal]
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: hoursUntilDeparture
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of upcoming bookings
 */
router.get("/bookings/upcoming", internalAuthMiddleware, internalController.getUpcomingBookings);
/**
 * @swagger
 * /api/v1/internal/bookings/{id}:
 *   get:
 *     summary: Get a specific booking
 *     tags: [Internal]
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 */
router.get("/bookings/:id", internalAuthMiddleware, internalController.getBooking);

module.exports = router;
