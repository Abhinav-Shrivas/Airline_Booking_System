const express = require("express");
const router = express.Router();
const flightController = require("../../controllers/flight.controller");
const { internalAuthMiddleware } = require("shared");

router.get("/flights/:id", internalAuthMiddleware, flightController.fetchFlight);

module.exports = router;
