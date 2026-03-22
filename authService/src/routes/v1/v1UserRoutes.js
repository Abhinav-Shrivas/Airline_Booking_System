const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const {
  authMiddleware,
  authorizeMiddleware,
  attemptLimiter
} = require("../../middlewares/index");

router.post("/change-password",attemptLimiter, authMiddleware, userController.changePassword);
router.delete("/:id", authMiddleware, authorizeMiddleware("ADMIN"), userController.deleteUser);
router.patch("/:id", userController.updateUser);
router.get("/:id", userController.fetchUser);

module.exports = router;
