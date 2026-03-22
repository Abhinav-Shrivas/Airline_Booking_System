const { AppError } = require("shared");
const {SESSION_COOKIE_NAME} = require("../config/serverConfig");
const requireSession = (req, res, next) => {
  const sessionToken = req.cookies[SESSION_COOKIE_NAME];

  if (!sessionToken) {
    throw new AppError("Session token missing", 401);
  }

  req.sessionToken = sessionToken;
  next();
};

module.exports = requireSession;
