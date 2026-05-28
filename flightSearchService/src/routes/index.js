const express = require("express");
const router = express.Router();
const {
  v1AirportRoutes,
  v1CityRoutes,
  v1AirplaneRoutes,
  v1FlightRoutes,
  v1InternalRoutes
} = require("./v1/index");

router.use("/v1/cities", v1CityRoutes);
router.use("/v1/airports", v1AirportRoutes);
router.use("/v1/airplanes", v1AirplaneRoutes);
router.use("/v1/flights", v1FlightRoutes);
router.use("/v1/internal", v1InternalRoutes);

module.exports = router;
