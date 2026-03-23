const express = require("express");
const router = express.Router();
const airplaneController = require("../../controllers/airplane.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/flight.validation");
router.post("/",authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), validate(schemas.createAirplane), airplaneController.createAirplane);
router.delete("/:id",authMiddleware, authorizeMiddleware("ADMIN"), airplaneController.deleteAirplane);
router.patch("/:id", authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), airplaneController.updateAirplane);
router.get("/:id", authMiddleware, authorizeMiddleware("AIRLINE_STAFF", "ADMIN"), airplaneController.fetchAirplane);

module.exports = router;