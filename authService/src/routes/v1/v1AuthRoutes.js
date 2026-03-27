const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");

const {
  attemptLimiter,
  sessionTokenMiddleware,
  authMiddleware,
  verifyResetToken,
} = require("../../middlewares/index");

const validate = require("shared").validate;
const schemas = require("../../utils/auth.validation");

// Public routes (rate limited + validated)
router.post(
  "/register",
  attemptLimiter,
  validate(schemas.register),
  authController.registerUser,
);
router.post(
  "/login",
  attemptLimiter,
  validate(schemas.login),
  authController.login,
);
router.post(
  "/sendOtp",
  attemptLimiter,
  validate(schemas.sendOtp),
  authController.sendOtp,
);
router.post(
  "/verifyOtp",
  attemptLimiter,
  validate(schemas.verifyOtp),
  authController.verifyOtpAndGetResetToken,
);
router.post(
  "/loginWithOtp",
  attemptLimiter,
  validate(schemas.verifyOtp),
  authController.loginWithOtp,
);

//oauth google based
router.get("/google", authController.redirectToGoogle);
router.get("/google/callback", authController.googleCallback);

// Token-based routes (session/reset token required)
router.post("/refresh", sessionTokenMiddleware, authController.refresh);
router.post("/logout", sessionTokenMiddleware, authController.logout);
router.patch(
  "/change-password-using-token",
  validate(schemas.resetPassword),
  verifyResetToken,
  authController.resetPasswordUsingToken,
);

// Authenticated routes (JWT required)
router.post(
  "/logoutFromOtherDevices",
  authMiddleware,
  authController.logoutFromOtherDevices,
);

module.exports = router;
