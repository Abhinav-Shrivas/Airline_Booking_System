const express = require('express');
const router = express.Router();
const cityController = require('../../controllers/city.controller');

router.post('/',cityController.createCity);
router.delete('/:id',cityController.deleteCity);
router.patch('/:id',cityController.updateCity);
router.get('/:id',cityController.fetchCity);
router.get('/',cityController.getAllCities);

module.exports = router;