const dotenv = require("dotenv");
dotenv.config();

// Auth & session constants (single source of truth)
const SESSION_ROLLING_DAYS = 7;
const SESSION_ABSOLUTE_DAYS = 30;
const SESSION_LIMIT_PER_USER = 2;
const OTP_EXPIRY_MINUTES = 2;
const OTP_MAX_ATTEMPTS = 5;

// access token are provided when the user login, it gets expired after 1 hour, then either login again or hit /refresh
const ACCESS_TOKEN_EXPIRY = "60m";

// 
const RESET_TOKEN_EXPIRY = "10m";
const SESSION_COOKIE_NAME = "sessionToken";
const SESSION_COOKIE_MAX_AGE_MS = SESSION_ROLLING_DAYS * 24 * 60 * 60 * 1000;

function getSessionCookieOptions(overrides = {}) {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_COOKIE_MAX_AGE_MS,
    ...overrides,
  };
}

module.exports = {
  PORT: process.env.PORT,
  SALT: parseInt(process.env.SALT, 10),
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  REDIS_URL : process.env.REDIS_URL,

  // Auth constants
  SESSION_ROLLING_DAYS,
  SESSION_ABSOLUTE_DAYS,
  SESSION_LIMIT_PER_USER,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  ACCESS_TOKEN_EXPIRY,
  RESET_TOKEN_EXPIRY,
  SESSION_COOKIE_MAX_AGE_MS,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
};
