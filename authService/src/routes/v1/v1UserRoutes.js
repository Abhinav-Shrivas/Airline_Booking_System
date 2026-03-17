const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const authMiddleware = require("../../middlewares/auth-middleware");
const authorize = require("../../middlewares/authorize");

router.post("/change-password",authMiddleware, userController.changePassword);
router.delete("/:id", authMiddleware, authorize("ADMIN"), userController.deleteUser);
router.patch("/:id", userController.updateUser);
router.get("/:id", userController.fetchUser);

module.exports = router;
