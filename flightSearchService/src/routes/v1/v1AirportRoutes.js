const express = require("express");
const router = express.Router();
const airportController = require("../../controllers/airport.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/flight.validation");

/**
 * @swagger
 * /api/v1/airports:
 *   post:
 *     summary: Create a new airport
 *     tags: [Airports]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - city_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Indira Gandhi International Airport
 *               city_id:
 *                 type: integer
 *                 example: 1
 *               address:
 *                 type: string
 *                 example: New Delhi, India
 *     responses:
 *       201:
 *         description: Airport created
 */
router.post("/",authMiddleware, authorizeMiddleware("ADMIN"), validate(schemas.createAirport), airportController.createAirport);
/**
 * @swagger
 * /api/v1/airports/{id}:
 *   delete:
 *     summary: Delete an airport
 *     tags: [Airports]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Airport ID
 *     responses:
 *       200:
 *         description: Airport deleted
 */
router.delete("/:id",authMiddleware, authorizeMiddleware("ADMIN"), airportController.deleteAirport);
/**
 * @swagger
 * /api/v1/airports/{id}:
 *   patch:
 *     summary: Update an airport
 *     tags: [Airports]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Airport ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Airport updated
 */
router.patch("/:id",authMiddleware, authorizeMiddleware("ADMIN"), airportController.updateAirport);
/**
 * @swagger
 * /api/v1/airports/{id}:
 *   get:
 *     summary: Get airport by ID
 *     tags: [Airports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Airport ID
 *     responses:
 *       200:
 *         description: Airport details
 */
router.get("/:id", airportController.fetchAirport);

module.exports = router;