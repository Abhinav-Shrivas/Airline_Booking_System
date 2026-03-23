const express = require("express");
const router = express.Router();
const airportController = require("../../controllers/airport.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/flight.validation");

router.post("/",authMiddleware, authorizeMiddleware("ADMIN"), validate(schemas.createAirport), airportController.createAirport);
router.delete("/:id",authMiddleware, authorizeMiddleware("ADMIN"), airportController.deleteAirport);
router.patch("/:id",authMiddleware, authorizeMiddleware("ADMIN"), airportController.updateAirport);
router.get("/:id", airportController.fetchAirport);

module.exports = router;