const jwt = require("jsonwebtoken");
const {
  JWT_SECRET_KEY,
  ACCESS_TOKEN_EXPIRY,
  RESET_TOKEN_EXPIRY,
} = require("../config/serverConfig");

function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function generateResetToken(email) {
  return jwt.sign(
    { email, purpose: "password-reset" },
    JWT_SECRET_KEY,
    { expiresIn: RESET_TOKEN_EXPIRY }
  );
}


module.exports = {
    generateAccessToken,
    generateResetToken
}