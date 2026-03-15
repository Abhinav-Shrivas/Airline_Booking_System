const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");
const attemptLimiter = require("../../middlewares/attempt-rate-limit");
const resetPasswordAuth = require("../../middlewares/verify-reset-token");
const authMiddleware = require("../../middlewares/auth-middleware");

router.post("/login",attemptLimiter, authController.login);
router.post("/refresh",authController.refresh);
router.post("/logout",authController.logout);
router.post("/change-password-using-token",resetPasswordAuth, authController.resetPasswordUsingToken);
router.post("/logoutFromOtherDevices",authMiddleware, authController.logoutFromOtherDevices);
router.post("/sendOtp",attemptLimiter, authController.sendOtp);
router.post("/verifyOtp", authController.verifyOtp);
router.post("/loginWithOtp",authController.verifyLoginOtp);

// router.get("/testing", authMiddleware, (req, res) => {
//  return res.status(200).json({
//     data: req.user,
//     success: true,
//     message: "User is verified",
//     error: {},
//   });
// });

module.exports = router;
