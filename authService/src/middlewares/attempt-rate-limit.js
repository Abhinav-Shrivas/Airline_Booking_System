const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const attemptLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // max 5 attempts per route
  message: {
    message: "Too many attempts. Try again later."
  },
  keyGenerator: (req) => `${ipKeyGenerator(req)}-${req.originalUrl}`,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = attemptLimiter;