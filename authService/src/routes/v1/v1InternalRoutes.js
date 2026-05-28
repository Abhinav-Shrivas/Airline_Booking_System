const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const { internalAuthMiddleware } = require("shared");

router.get("/users/:id", internalAuthMiddleware, userController.fetchUser);

module.exports = router;
