const authService = require("../services/auth.service");
const { getSessionCookieOptions } = require("../config/serverConfig");
const { asyncHandler, successResponse, AppError } = require("shared");
const { SESSION_COOKIE_NAME } = require("../config/serverConfig");
const { getGoogleAuthURL } = require("../utils/google-oauth");

const registerUser = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.cookie(
    SESSION_COOKIE_NAME,
    result.sessionToken,
    getSessionCookieOptions(),
  );
  successResponse(res, {
    message: "Successfully registered the user.",
    data: {
      email: result.user.email,
      accessToken: result.accessToken,
    },
    statusCode: 201,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie(
    SESSION_COOKIE_NAME,
    result.sessionToken,
    getSessionCookieOptions(),
  );
  successResponse(res, {
    message: "Login Successful",
    data: {
      email: result.user.email,
      accessToken: result.accessToken,
    },
    statusCode: 200,
  });
});

//login with google
const redirectToGoogle = asyncHandler(async (req, res) => {
  const { url, state } = getGoogleAuthURL();
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 5 * 60 * 1000, // 5 minutes
  });

  res.redirect(url);
});

const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies.oauth_state;

  // Verify state to prevent CSRF
  if (!state || state !== storedState) {
    throw new AppError("Invalid OAuth state. Please try again.", 403);
  }

  res.clearCookie("oauth_state");

  if (!code) {
    throw new AppError("Authorization code not provided", 400);
  }
  const result = await authService.loginWithGoogle(code);

  res.cookie(
    SESSION_COOKIE_NAME,
    result.sessionToken,
    getSessionCookieOptions(),
  );

  // Redirect to frontend with access token
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  const redirectUrl = `${frontendURL}/auth/google/callback?accessToken=${encodeURIComponent(result.accessToken)}&email=${encodeURIComponent(result.user.email)}`;
  res.redirect(redirectUrl);
});

//refresh

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.sessionToken);
  res.cookie(
    SESSION_COOKIE_NAME,
    result.newSessionToken,
    getSessionCookieOptions(),
  );

  successResponse(res, {
    message: "Successful",
    data: {
      accessToken: result.accessToken,
    },
    statusCode: 200,
  });
});

const logout = asyncHandler(async (req, res) => {
  const sessionToken = req.cookies[SESSION_COOKIE_NAME];
  await authService.logout(sessionToken);
  res.clearCookie(SESSION_COOKIE_NAME);

  successResponse(res, {
    message: "Logout Successful",
    statusCode: 200,
  });
});

const logoutFromOtherDevices = asyncHandler(async (req, res) => {
  await authService.logoutFromOtherDevices(req.jwtPayload);

  successResponse(res, {
    message: "Successfully logged out from all other devices.",
    statusCode: 200,
  });
});

const sendOtp = asyncHandler(async (req, res) => {
  const response = await authService.sendOtp(req.body.email);
  successResponse(res, {
    message: "If the email exists, successfully send the otp.",
    data: {
      otpId: response.otpId,
    },
    statusCode: 200,
  });
});

const verifyOtpAndGetResetToken = asyncHandler(async (req, res) => {
  const resetToken = await authService.verifyOtpAndGetResetToken(req.body);
  successResponse(res, {
    message: "Otp verified.",
    data: {
      resetToken,
    },
    statusCode: 200,
  });
});

const loginWithOtp = asyncHandler(async (req, res) => {
  const result = await authService.loginWithOtp(req.body);

  res.cookie(
    SESSION_COOKIE_NAME,
    result.sessionToken,
    getSessionCookieOptions(),
  );

  successResponse(res, {
    message: "Login Successful",
    data: {
      accessToken: result.accessToken,
    },
    statusCode: 200,
  });
});

const resetPasswordUsingToken = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const email = req.resetPayload.email;

  await authService.changePasswordWithToken(email, newPassword);

  successResponse(res, {
    message: "Successfully reset the user password.",
    statusCode: 200,
  });
});

module.exports = {
  login,
  registerUser,
  logout,
  refresh,
  logoutFromOtherDevices,
  sendOtp,
  verifyOtpAndGetResetToken,
  resetPasswordUsingToken,
  loginWithOtp,
  redirectToGoogle,
  googleCallback,
};
