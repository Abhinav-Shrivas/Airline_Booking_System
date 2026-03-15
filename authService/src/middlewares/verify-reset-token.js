const { verifyAccessToken } = require("../utils/jwt");

const resetPasswordAuth = async(req, res, next) => {
  try {
    const resetToken = req.headers.authorization;
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Reset token required"
      });
    }
    const token = resetToken.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (payload.purpose !== "password-reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid token purpose"
      });
    }

    req.resetPayload = payload;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid or expired reset token"
    });

  }
};

module.exports = resetPasswordAuth;