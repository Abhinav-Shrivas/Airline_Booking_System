const { verifyAccessToken } = require("../utils/jwt");
const {AppError} = require("shared");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authorization header missing", 401);
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyAccessToken(token);

    req.jwtPayload = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid or expired token", 401);
  }
}

module.exports = authMiddleware;
