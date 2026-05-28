const express = require("express");
const router = express.Router();
const internalController = require("../../controllers/internal.controller");
const { internalAuthMiddleware } = require("shared");

// GET /api/v1/internal/bookings/upcoming?hoursUntilDeparture=24
router.get("/bookings/upcoming", internalAuthMiddleware, internalController.getUpcomingBookings);

module.exports = router;
