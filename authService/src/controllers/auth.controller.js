const authService = require("../services/auth.service");
const { getSessionCookieOptions } = require("../config/serverConfig");
const { asyncHandler, successResponse } = require("shared");
const {SESSION_COOKIE_NAME} = require("../config/serverConfig");

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
      accessToken : result.accessToken,
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
      accessToken : result.accessToken,
    },
    statusCode: 200,
  });
});

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
  res.clearCookie(SESSION_COOKIE_NAME);

  successResponse(res, {
    message: "Logout Successful",
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
};
