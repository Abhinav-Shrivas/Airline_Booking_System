const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/city.controller");
const { validate, authMiddleware, authorizeMiddleware } = require("shared");
const schemas = require("../../utils/flight.validation");

router.post("/",authMiddleware, authorizeMiddleware("ADMIN"), validate(schemas.createCity), cityController.createCity);
router.delete("/:id",authMiddleware, authorizeMiddleware("ADMIN"), cityController.deleteCity);
router.patch("/:id",authMiddleware, authorizeMiddleware("ADMIN"), cityController.updateCity);
router.get("/:id", cityController.fetchCity);
router.get("/", cityController.getAllCities);

module.exports = router;