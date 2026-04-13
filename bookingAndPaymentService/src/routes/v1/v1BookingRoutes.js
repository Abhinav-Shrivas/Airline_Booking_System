const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/booking.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/booking.validation");

router.post("/", authMiddleware, validate(schemas.createBooking), bookingController.createBooking);
router.get("/", authMiddleware, bookingController.getUserBookings);
router.get("/:id", authMiddleware, bookingController.getBooking);
router.patch("/:id/cancel", authMiddleware, bookingController.cancelBooking);
router.post("/:id/refund", authMiddleware, authorizeMiddleware("USER"), bookingController.refundBooking);

module.exports = router;
