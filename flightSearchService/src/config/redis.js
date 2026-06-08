const Redis = require("ioredis");
const { REDIS_URL } = require("./serverConfig");
const { logger } = require("shared");

const redis = new Redis(REDIS_URL);

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error(`Redis error: ${err.message}`));

module.exports = redis;
