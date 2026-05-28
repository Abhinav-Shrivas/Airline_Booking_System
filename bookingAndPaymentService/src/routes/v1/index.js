const express = require("express");
const router = express.Router();
const bookingRoutes = require("./v1BookingRoutes");
const paymentRoutes = require("./v1PaymentRoutes");
const adminBookingRoutes = require("./v1AdminBookingRoutes");
const internalRoutes = require("./v1InternalRoutes");

router.use("/internal", internalRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin/bookings", adminBookingRoutes);

module.exports = router;
