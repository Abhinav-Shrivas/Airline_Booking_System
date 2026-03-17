const authService = require("../services/auth.service");
const { getSessionCookieOptions } = require("../config/serverConfig");

const SESSION_COOKIE_NAME = "sessionToken";

const registerUser = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.cookie(SESSION_COOKIE_NAME, result.sessionToken, getSessionCookieOptions());
    return res.status(201).json({
      message: "Successfully register the user.",
      data: {
        id: result.user.id,
        name : result.user.name,
        email: result.user.email,
      },
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.log(error);
    if (error.message === "User already exists. Please sign in.") {
        return res.status(409).json({   // Or 400 Bad Request
            success: false,
            message: error.message,
            error: {}
        });
    }
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.cookie(SESSION_COOKIE_NAME, result.sessionToken, getSessionCookieOptions());
    return res.status(200).json({
      message: "Login successful",
      data: {
        id: result.user.id,
        name : result.user.name,
        email: result.user.email,
      },
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};

const refresh = async (req, res) => {
  try {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session token missing",
      });
    }

    const result = await authService.refresh(sessionToken);

    res.cookie(SESSION_COOKIE_NAME, result.newSessionToken, getSessionCookieOptions());

    return res.status(200).json({
      accessToken: result.accessToken,
    });
  } catch (error) {
    return res.status(401).json({
       success: false,
      error: error.message,
    });
  }
}

const logout = async (req, res) => {
  try {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session token missing",
      });
    }

    await authService.logout(sessionToken);
    res.clearCookie(SESSION_COOKIE_NAME);

    return res.status(200).json({
      success: true,
      message: "Successfully logout the User.",
      error: {},
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message,
    });
  }
}

const logoutFromOtherDevices = async (req, res) => {
  try {
    await authService.logoutFromOtherDevices(req.jwtPayload);
    res.clearCookie(SESSION_COOKIE_NAME);
    
    return res.status(200).json({
      success: true,
      message: "Successfully logout the User from all the devices.",
      error: {},
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message,
    });
  }
}


const sendOtp = async (req, res) => {
  try {
    const response = await authService.sendOtp(req.body.email);
    return res.status(200).json({
      success: true,
      otpId : response.otpId,
      message: "If the email exists, successfully send the otp.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};

const verifyOtpAndGetResetToken = async (req, res) => {
  try {
    const resetToken = await authService.verifyOtpAndGetResetToken(req.body);
    return res.status(200).json({
      success: true,
      resetToken,
      message: "Successfully verified the otp.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};

const loginWithOtp = async (req, res) => {
  try {
    const result = await authService.loginWithOtp(req.body);

    res.cookie(SESSION_COOKIE_NAME, result.sessionToken, getSessionCookieOptions());

    return res.status(200).json({
      success: true,
      accessToken: result.accessToken
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

const resetPasswordUsingToken = async (req, res) => {
  try {

    const { newPassword } = req.body;
    const email = req.resetPayload.email;

    await authService.changePasswordWithToken(email, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};


module.exports = {
  login,
  registerUser,
  logout,
  refresh,
  logoutFromOtherDevices,
  sendOtp,
  verifyOtpAndGetResetToken,
  resetPasswordUsingToken,
  loginWithOtp
};
