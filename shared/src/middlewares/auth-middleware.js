const verifyAccessToken = require("../utils/verifyToken");
const AppError = require("../errors/appError");
const asyncHandler = require("../utils/asyncHandler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError("Authorization header missing", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.jwtPayload = payload;
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }

  next();
});

module.exports = authMiddleware;
