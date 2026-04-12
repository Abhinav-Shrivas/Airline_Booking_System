const express = require("express");
const router = express.Router();
const bookingRoutes = require("./v1BookingRoutes");
const paymentRoutes = require("./v1PaymentRoutes");

router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
