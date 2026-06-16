const express = require("express");
const router = express.Router();
const airplaneController = require("../../controllers/airplane.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/flight.validation");
/**
 * @swagger
 * /api/v1/airplanes:
 *   post:
 *     summary: Create a new airplane
 *     tags: [Airplanes]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelNo
 *               - capacity
 *             properties:
 *               modelNo:
 *                 type: string
 *                 example: Boeing 737
 *               capacity:
 *                 type: integer
 *                 example: 180
 *     responses:
 *       201:
 *         description: Airplane created
 */
router.post("/",authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), validate(schemas.createAirplane), airplaneController.createAirplane);
/**
 * @swagger
 * /api/v1/airplanes/{id}:
 *   delete:
 *     summary: Delete an airplane
 *     tags: [Airplanes]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Airplane ID
 *     responses:
 *       200:
 *         description: Airplane deleted
 */
router.delete("/:id",authMiddleware, authorizeMiddleware("ADMIN"), airplaneController.deleteAirplane);
/**
 * @swagger
 * /api/v1/airplanes/{id}:
 *   patch:
 *     summary: Update an airplane
 *     tags: [Airplanes]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Airplane ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Airplane updated
 */
router.patch("/:id", authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), airplaneController.updateAirplane);
/**
 * @swagger
 * /api/v1/airplanes/{id}:
 *   get:
 *     summary: Get airplane by ID
 *     tags: [Airplanes]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Airplane ID
 *     responses:
 *       200:
 *         description: Airplane details
 */
router.get("/:id", authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), airplaneController.fetchAirplane);
/**
 * @swagger
 * /api/v1/airplanes:
 *   get:
 *     summary: Get all airplanes
 *     tags: [Airplanes]
 *     description: "Access: AIRLINE_STAFF, ADMIN"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of airplanes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get("/", authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), airplaneController.getAllAirplanes);

module.exports = router;