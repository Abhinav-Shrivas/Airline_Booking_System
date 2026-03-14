const userService = require("../services/user.service");

const registerUser = async (req, res) => {
  try {
    const data = await userService.register(req.body);
    return res.status(201).json({
      data: data,
      success: true,
      message: "Successfully created the User",
      error: {},
    });
  } catch (error) {
    console.log(error);
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
    const result = await userService.login(req.body);
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

async function refresh(req, res) {
  try {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session token missing",
      });
    }

    const result = await userService.refresh(sessionToken);

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

async function logout(req, res) {
  try {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session token missing",
      });
    }

    await userService.logout(sessionToken);
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

async function logoutFromAllDevices(req, res) {
  try {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session token missing",
      });
    }

    await userService.logoutFromAllDevices(sessionToken);
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

const changePassword = async (req, res) => {
  try {
    console.log(req.jwtPayload);
    await userService.changePassword(req.jwtPayload.userId,req.body);
    res.clearCookie("sessionToken");
    return res.status(200).json({
      success: true,
      message: "Successfully changed the user password.",
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

const sendOtp = async (req, res) => {
  try {
    const response = await userService.sendOtp(req.body.email);
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
    const resetToken = await userService.verifyOtp(req.body);
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

const resetPasswordUsingToken = async (req, res) => {
  try {

    const { newPassword } = req.body;
    const email = req.resetPayload.email;

    await userService.changePasswordWithToken(email, newPassword);

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

const fetchUser = async (req, res) => {
  try {
    const data = await userService.fetch(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully fetched the User.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const data = await userService.update(req.params.id, req.body);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully updated the User.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const data = await userService.destroy(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully deleted the User.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  fetchUser,
  updateUser,
  deleteUser,
  login,
  logout,
  refresh,
  logoutFromAllDevices,
  changePassword,
  sendOtp,
  verifyOtp,
  resetPasswordUsingToken
};
