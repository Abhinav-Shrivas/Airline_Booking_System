const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const attemptLimiter = require("../../middlewares/attempt-rate-limit")
const authMiddleware = require("../../middlewares/auth-middleware");
const resetPasswordAuth = require("../../middlewares/password-reset-middleware");

router.post("/register", userController.registerUser);
router.post("/login",attemptLimiter, userController.login);
router.post("/refresh",userController.refresh);
router.post("/logout",userController.logout);
router.post("/change-password",authMiddleware, userController.changePassword);
router.post("/change-password-using-token",resetPasswordAuth, userController.resetPasswordUsingToken);
router.post("/logoutFromOtherDevices",authMiddleware, userController.logoutFromOtherDevices);
router.post("/sendOtp",attemptLimiter, userController.sendOtp);
router.post("/verifyOtp",userController.verifyOtp);
router.post("/loginWithOtp",userController.verifyLoginOtp);
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
