const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/booking.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/booking.validation");

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking for one way trip only
 *     tags: [Bookings]
 *     description: "Access: Any authenticated user"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightId
 *               - noOfSeats
 *               - passengers
 *             properties:
 *               flightId:
 *                 type: integer
 *                 example: 1
 *               noOfSeats:
 *                 type: integer
 *                 example: 2
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - fullName
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     age:
 *                       type: integer
 *                       example: 28
 *                     seatNo:
 *                       type: string
 *                       example: 12A
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post("/", authMiddleware, validate(schemas.createBooking), bookingController.createBooking);
/**
 * @swagger
 * /api/v1/bookings/round:
 *   post:
 *     summary: Create a new booking for round trip only
 *     tags: [Bookings]
 *     description: "Access: Any authenticated user"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - outboundFlightId
 *               - returnFlightId   
 *               - noOfSeats
 *               - passengers
 *             properties:
 *               outboundFlightId:
 *                 type: integer
 *                 example: 1
 *               returnFlightId:
 *                 type: integer
 *                 example: 1
 *               noOfSeats:
 *                 type: integer
 *                 example: 2
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - fullName
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     age:
 *                       type: integer
 *                       example: 28
 *                     seatNo:
 *                       type: string
 *                       example: 12A
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post("/round", authMiddleware, validate(schemas.createBookingRound), bookingController.createBookingRound);
/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get all bookings for the logged in user
 *     tags: [Bookings]
 *     description: "Access: Any authenticated user (returns own bookings)"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/", authMiddleware, bookingController.getUserBookings);
/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get a specific booking
 *     tags: [Bookings]
 *     description: "Access: Any authenticated user (own bookings only)"
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
 *         description: Booking details
 */
router.get("/:id", authMiddleware, bookingController.getBooking);
/**
 * @swagger
 * /api/v1/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     description: "Access: Any authenticated user (own bookings, pre-payment only — INITIATED/PENDING status)"
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
 *         description: Booking cancelled
 */
router.patch("/:id/cancel", authMiddleware, bookingController.cancelBooking);
/**
 * @swagger
 * /api/v1/bookings/{id}/refund:
 *   post:
 *     summary: Request refund for a booking
 *     tags: [Bookings]
 *     description: "Access: USER only (post-payment, must be 24+ hours before departure)"
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
 *         description: Refund initiated
 */
router.post("/:id/refund", authMiddleware, authorizeMiddleware("USER"), bookingController.refundBooking);

module.exports = router;
