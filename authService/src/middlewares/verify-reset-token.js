const { verifyAccessToken } = require("shared");
const { AppError } = require("shared");
const resetPasswordAuth = async (req, res, next) => {
  try {
    const resetToken = req.headers.authorization;
    if (!resetToken) {
      throw new AppError("Reset token required.",400);
    }
    const token = resetToken.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (payload.purpose !== "password-reset") {
      throw new AppError("Invalid Token.", 401);
    }
    req.resetPayload = payload;

    next();
  } catch (error) {
    if(error instanceof AppError)throw error;
    throw new AppError("Invalid Token.", 401);
  }
};

module.exports = resetPasswordAuth;
