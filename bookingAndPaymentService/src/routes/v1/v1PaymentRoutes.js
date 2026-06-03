const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/payment.controller");
const { validate, authMiddleware } = require("shared");
const schemas = require("../../utils/payment.validation");

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     summary: Initiate a payment
 *     tags: [Payments]
 *     description: "Access: Any authenticated user (own bookings only)"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Payment initiated
 */
router.post("/", authMiddleware, validate(schemas.initiatePayment), paymentController.initiatePayment);
/**
 * @swagger
 * /api/v1/payments/booking/{bookingId}:
 *   get:
 *     summary: Get payment by booking ID
 *     tags: [Payments]
 *     description: "Access: Any authenticated user (own bookings only)"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Payment details
 */
router.get("/booking/:bookingId", authMiddleware, paymentController.getPaymentByBooking);

module.exports = router;
