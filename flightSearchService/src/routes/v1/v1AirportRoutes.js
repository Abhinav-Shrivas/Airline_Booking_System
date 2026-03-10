const express = require('express');
const router = express.Router();
const airportController = require('../../controllers/airport.controller');

router.post('/',airportController.createAirport);
router.delete('/:id',airportController.deleteAirport);
router.patch('/:id',airportController.updateAirport);
router.get('/:id',airportController.fetchAirport);

module.exports = router;