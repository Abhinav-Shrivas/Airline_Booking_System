const AppError = require("../errors/appError");
function internalAuthMiddleware(req, res, next) {
  const apiKey = req.headers["x-internal-api-key"];

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    throw new AppError("Unauthorized: invalid or missing internal API key", 401);
  }

  next();
}

module.exports = internalAuthMiddleware;
