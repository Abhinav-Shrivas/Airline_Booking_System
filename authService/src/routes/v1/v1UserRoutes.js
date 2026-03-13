const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const loginLimiter = require("../../middlewares/login-rate-limit")
const authMiddleware = require("../../middlewares/auth-middleware");

router.post("/register", userController.registerUser);
router.post("/login",loginLimiter, userController.login);
router.post("/refresh",userController.refresh);
router.post("/logout",userController.logout);
router.post("/change-password",authMiddleware, userController.changePassword);
router.post("/logoutFromAllDevice",userController.logoutFromAllDevices);
router.delete("/:id", userController.deleteUser);
router.patch("/:id", userController.updateUser);
// router.get("/testing", authMiddleware, (req, res) => {
//  return res.status(200).json({
//     data: req.user,
//     success: true,
//     message: "User is verified",
//     error: {},
//   });
// });

router.get("/:id", userController.fetchUser);

module.exports = router;
