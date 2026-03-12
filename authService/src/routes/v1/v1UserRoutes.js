const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');

router.post('/register',userController.registerUser);
router.post('/login',userController.login);
router.delete('/:id',userController.deleteUser);
router.patch('/:id',userController.updateUser);
router.get('/:id',userController.fetchUser);

module.exports = router;