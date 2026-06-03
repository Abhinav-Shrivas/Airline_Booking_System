const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/city.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/flight.validation");

/**
 * @swagger
 * /api/v1/cities:
 *   post:
 *     summary: Create a new city
 *     tags: [Cities]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: City created
 */
router.post("/",authMiddleware, authorizeMiddleware("ADMIN"), validate(schemas.createCity), cityController.createCity);
/**
 * @swagger
 * /api/v1/cities/{id}:
 *   delete:
 *     summary: Delete a city
 *     tags: [Cities]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: City ID
 *     responses:
 *       200:
 *         description: City deleted
 */
router.delete("/:id",authMiddleware, authorizeMiddleware("ADMIN"), cityController.deleteCity);
/**
 * @swagger
 * /api/v1/cities/{id}:
 *   patch:
 *     summary: Update a city
 *     tags: [Cities]
 *     description: "Access: ADMIN only"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: City ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: City updated
 */
router.patch("/:id",authMiddleware, authorizeMiddleware("ADMIN"), cityController.updateCity);
/**
 * @swagger
 * /api/v1/cities/{id}:
 *   get:
 *     summary: Get city by ID
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: City ID
 *     responses:
 *       200:
 *         description: City details
 */
router.get("/:id", cityController.fetchCity);
/**
 * @swagger
 * /api/v1/cities:
 *   get:
 *     summary: Get all cities
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter cities by name
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get("/", cityController.getAllCities);

module.exports = router;