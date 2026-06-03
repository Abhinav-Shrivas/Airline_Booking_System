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
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */
router.post(
  "/register",
  attemptLimiter,
  validate(schemas.register),
  authController.registerUser,
);
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post(
  "/login",
  attemptLimiter,
  validate(schemas.login),
  authController.login,
);
/**
 * @swagger
 * /api/v1/auth/sendOtp:
 *   post:
 *     summary: Send OTP for login or password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post(
  "/sendOtp",
  attemptLimiter,
  validate(schemas.sendOtp),
  authController.sendOtp,
);
/**
 * @swagger
 * /api/v1/auth/verifyOtp:
 *   post:
 *     summary: Verify OTP and get reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otpId
 *               - otp
 *             properties:
 *               otpId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               otp:
 *                 type: integer
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified, reset token returned
 *       400:
 *         description: Invalid or expired OTP
 */
router.post(
  "/verifyOtp",
  attemptLimiter,
  validate(schemas.verifyOtp),
  authController.verifyOtpAndGetResetToken,
);
/**
 * @swagger
 * /api/v1/auth/loginWithOtp:
 *   post:
 *     summary: Login using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otpId
 *               - otp
 *             properties:
 *               otpId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               otp:
 *                 type: integer
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid OTP
 */
router.post(
  "/loginWithOtp",
  attemptLimiter,
  validate(schemas.verifyOtp),
  authController.loginWithOtp,
);

//oauth google based
/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Redirects to Google OAuth page
 *     tags: [Auth]
 *     description: |
 *       This is a redirect-based OAuth flow. Swagger's "Try it out" won't work here.
 *
 *       **[→ Click here to login with Google](/api/v1/auth/google)**
 *
 *       (Opens in this tab — right-click and "Open in new tab" recommended)
 *     responses:
 *       302:
 *         description: Redirects to Google
 */
router.get("/google", authController.redirectToGoogle);

router.get("/google/callback", authController.googleCallback);

// Token-based routes (session/reset token required)
/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using session cookie
 *     tags: [Auth]
 *     description: Uses the sessionToken cookie (set automatically on login) to issue a new access token.
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired session
 */
router.post("/refresh", sessionTokenMiddleware, authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and clear session
 *     tags: [Auth]
 *     description: Clears the sessionToken cookie.
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", sessionTokenMiddleware, authController.logout);

/**
 * @swagger
 * /api/v1/auth/change-password-using-token:
 *   patch:
 *     summary: Reset password using the reset token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Requires the reset token (from /verifyOtp) in Authorization header. This is NOT a JWT access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: newPassword123!
 *     responses:
 *       200:
 *         description: Password updated
 */
router.patch(
  "/change-password-using-token",
  validate(schemas.resetPassword),
  verifyResetToken,
  authController.resetPasswordUsingToken,
);

// Authenticated routes (JWT required)
/**
 * @swagger
 * /api/v1/auth/logoutFromOtherDevices:
 *   post:
 *     summary: Logout from all other devices
 *     tags: [Auth]
 *     description: "Access: Any authenticated user"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from other devices
 */
router.post(
  "/logoutFromOtherDevices",
  authMiddleware,
  authController.logoutFromOtherDevices,
);

module.exports = router;
