const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.jwtPayload.roles;
    console.log(userRoles)
    // Check if the user has at least one of the allowed roles
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};
module.exports = authorize;