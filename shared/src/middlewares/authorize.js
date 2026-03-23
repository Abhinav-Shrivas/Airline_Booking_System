const AppError = require("../errors/appError");
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.jwtPayload.roles;
    // Check if the user has at least one of the allowed roles
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    if (!hasPermission) {
      throw new AppError("Access denied.", 403);
    }
    next();
  };
};
module.exports = authorize;