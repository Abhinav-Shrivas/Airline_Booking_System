const express = require('express');
const router = express.Router();
const airplaneController = require('../../controllers/airplane.controller');

router.post('/',airplaneController.createAirplane);
router.delete('/:id',airplaneController.deleteAirplane);
router.patch('/:id',airplaneController.updateAirplane);
router.get('/:id',airplaneController.fetchAirplane);

module.exports = router;