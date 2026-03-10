const express = require('express');
const router = express.Router();
const flightController = require('../../controllers/flight.controller');
const { validateGetFlights } = require('../../middlewares/flight.middleware');

router.post('/',flightController.createFlight);
router.delete('/:id',flightController.deleteFlight);
router.patch('/:id',flightController.updateFlight);
router.get('/:id',flightController.fetchFlight);
router.get('/', validateGetFlights, flightController.getFlights);

module.exports = router;