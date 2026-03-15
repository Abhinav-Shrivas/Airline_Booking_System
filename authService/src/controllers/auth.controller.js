const authService = require("../services/auth.service");

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.cookie("sessionToken", result.sessionToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, //for development it is set as false
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Login successful",
      data: {
        id: result.user.id,
        email: result.user.email,
      },
      successToken: result.accessToken,
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

const refresh = async(req, res)=>{
  try {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session token missing",
      });
    }

    const result = await authService.refresh(sessionToken);

    res.cookie("sessionToken", result.newSessionToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

const logout = async(req, res)=>{
  try {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session token missing",
      });
    }

    await authService.logout(sessionToken);
    res.clearCookie("sessionToken");

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

const logoutFromOtherDevices =  async (req, res) => {
  try {
    await authService.logoutFromOtherDevices(req.jwtPayload);
    res.clearCookie("sessionToken");
    
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

const verifyOtp = async (req, res) => {
  try {
    const resetToken = await authService.verifyOtp(req.body);
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

const verifyLoginOtp = async (req, res) => {
  try {
    const result = await authService.loginWithOtp(req.body);

    res.cookie("sessionToken", result.sessionToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false
    });

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
  logout,
  refresh,
  logoutFromOtherDevices,
  sendOtp,
  verifyOtp,
  resetPasswordUsingToken,
  verifyLoginOtp
};
