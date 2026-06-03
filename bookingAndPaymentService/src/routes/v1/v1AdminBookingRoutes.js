const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/booking.controller");
const { authMiddleware, authorizeMiddleware } = require("shared");

/**
 * @swagger
 * /api/v1/admin/bookings/{id}/refund:
 *   post:
 *     summary: Admin refund a booking
 *     tags: [Admin]
 *     description: "Access: ADMIN, SUPPORT_AGENT. Skips 24-hour rule and ownership check."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Refund initiated by Admin
 */
router.post(
  "/:id/refund",
  authMiddleware,
  authorizeMiddleware("ADMIN", "SUPPORT_AGENT"),
  bookingController.adminRefundBooking,
);

/**
 * @swagger
 * /api/v1/admin/bookings/{id}/cancel:
 *   patch:
 *     summary: Admin cancel booking without refund
 *     description: "Access: ADMIN, AIRLINE_STAFF. Cancels a CONFIRMED booking without processing a refund (e.g., no-show, fraud, policy violation)"
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled without refund
 */
router.patch(
  "/:id/cancel",
  authMiddleware,
  authorizeMiddleware("ADMIN", "AIRLINE_STAFF"),
  bookingController.adminCancelBooking,
);

module.exports = router;
