const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/payment.controller");
const { validate, authMiddleware } = require("shared");
const schemas = require("../../utils/payment.validation");

router.post("/", authMiddleware, validate(schemas.initiatePayment), paymentController.initiatePayment);
router.get("/booking/:bookingId", authMiddleware, paymentController.getPaymentByBooking);

module.exports = router;
