const express = require("express");
const router = express.Router();
const flightController = require("../../controllers/flight.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/flight.validation");

/**
 * @swagger
 * /api/v1/flights:
 *   post:
 *     summary: Create a new flight
 *     tags: [Admin-Flights]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: |
 *         Flight creation rules:
 *         - departure_airport_id is the airport from which the flight takes off.
 *         - arrival_airport_id is the airport where the flight lands.
 *         - arrivalTime must be later than departureTime.
 *         - totalSeatsLeft is optional. If omitted, it defaults to the airplane's capacity.
 *         - If provided, totalSeatsLeft cannot exceed the capacity of the selected airplane.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flightNo
 *               - airplane_id
 *               - departure_airport_id
 *               - arrival_airport_id
 *               - departureTime
 *               - arrivalTime
 *               - price
 *             properties:
 *               flightNo:
 *                 type: string
 *                 example: AI-202
 *               airplane_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the airplane assigned to this flight.
 *               departure_airport_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the airport from which the flight takes off.
 *               arrival_airport_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the airport where the flight lands.
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-15T08:00:00Z
 *                 description: Scheduled departure time.
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-15T10:30:00Z
 *                 description: Must be later than departureTime.
 *               price:
 *                 type: integer
 *                 example: 5500
 *                 description: Ticket price per seat.
 *               totalSeatsLeft:
 *                 type: integer
 *                 example: 180
 *                 description: Optional. Defaults to the airplane capacity if omitted. Cannot exceed the selected airplane's capacity.
 *               boardingGate:
 *                 type: string
 *                 example: G4
 *                 description: Boarding gate for the flight.
 *     responses:
 *       201:
 *         description: Flight created
 *       400:
 *         description: Invalid request data or business rule violation
 */
router.post(
  "/",
  authMiddleware,
  authorizeMiddleware("AIRLINE_STAFF", "ADMIN"),
  validate(schemas.createFlight),
  flightController.createFlight,
);
/**
 * @swagger
 * /api/v1/flights/{id}:
 *   delete:
 *     summary: Delete a flight
 *     tags: [Admin-Flights]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flight ID
 *     responses:
 *       200:
 *         description: Flight deleted
 */
router.delete(
  "/:id",
  authMiddleware,
  authorizeMiddleware("ADMIN"),
  flightController.deleteFlight,
);
/**
 * @swagger
 * /api/v1/flights/{id}:
 *   patch:
 *     summary: Update a flight
 *     tags: [Admin-Flights]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flight ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Flight updated
 */
router.patch(
  "/:id",
  authMiddleware,
  authorizeMiddleware("AIRLINE_STAFF", "ADMIN"),
  flightController.updateFlight,
);
/**
 * @swagger
 * /api/v1/flights/all:
 *   get:
 *     summary: Get all flights
 *     tags: [Admin-Flights]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all flights
 */
router.get(
  "/all",
  authMiddleware,
  authorizeMiddleware("AIRLINE_STAFF", "ADMIN"),
  flightController.getAllFlights,
);
/**
 * @swagger
 * /api/v1/flights/{id}:
 *   get:
 *     summary: Get flight by ID
 *     tags: [Admin-Flights]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flight ID
 *     responses:
 *       200:
 *         description: Flight details
 */
router.get(
  "/:id",
  authMiddleware,
  authorizeMiddleware("AIRLINE_STAFF", "ADMIN"),
  flightController.fetchFlight,
);
/**
 * @swagger
 * /api/v1/flights:
 *   get:
 *     summary: Search flights
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: integer
 *         description: Departure city ID
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: integer
 *         description: Arrival city ID
 *       - in: query
 *         name: departureDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Departure date (YYYY-MM-DD)
 *       - in: query
 *         name: noOfSeats
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of seats required
 *       - in: query
 *         name: trip
 *         schema:
 *           type: string
 *           enum: [one-way, round]
 *           default: one-way
 *       - in: query
 *         name: returnDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Required when trip is round
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price, duration]
 *           default: price
 *       - in: query
 *         name: moreFlights
 *         schema:
 *           type: string
 *           enum: [yes, no]
 *           default: no
 *     responses:
 *       200:
 *         description: List of flights
 */
router.get(
  "/",
  validate(schemas.searchFlights, "query"),
  flightController.getFlights,
);
/**
 * @swagger
 * /api/v1/flights/{id}/seats:
 *   patch:
 *     summary: Update flight seats (Admin or staff)
 *     tags: [Admin-Flights]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Flight ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - seatsToIncrement
 *                 properties:
 *                   seatsToIncrement:
 *                     type: integer
 *                     minimum: 1
 *               - type: object
 *                 required:
 *                   - seatsToDecrement
 *                 properties:
 *                   seatsToDecrement:
 *                     type: integer
 *                     minimum: 1
 *     responses:
 *       200:
 *         description: Seats updated
 */
router.patch(
  "/:id/seats",
  authMiddleware,
  authorizeMiddleware("AIRLINE_STAFF", "ADMIN"),
  flightController.updateSeats,
);

module.exports = router;
