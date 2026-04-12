const express = require("express");
const router = express.Router();
const flightController = require("../../controllers/flight.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/flight.validation");

router.post("/",authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), validate(schemas.createFlight), flightController.createFlight);
router.delete("/:id",authMiddleware, authorizeMiddleware("ADMIN"), flightController.deleteFlight);
router.patch("/:id",authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), flightController.updateFlight);
router.get("/:id", flightController.fetchFlight);
router.get("/", validate(schemas.searchFlights, "query"), flightController.getFlights);
router.patch("/:id/seats", flightController.updateSeats);

module.exports = router;