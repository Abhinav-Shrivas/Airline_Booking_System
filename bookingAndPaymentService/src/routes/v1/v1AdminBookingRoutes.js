const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/booking.controller");
const { authMiddleware, authorizeMiddleware } = require("shared");

router.post(
  "/:id/refund",
  authMiddleware,
  authorizeMiddleware("ADMIN", "SUPPORT_AGENT"),
  bookingController.adminRefundBooking,
);

module.exports = router;
