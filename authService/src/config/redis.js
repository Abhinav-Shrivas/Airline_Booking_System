const Redis = require("ioredis");
const { REDIS_URL } = require("./serverConfig");
const { logger } = require("shared");

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1, // fail fast on individual commands
  retryStrategy(times) {
    logger.warn(`Redis reconnect attempt ${times}`);

    return Math.min(times * 500, 60000);
  },
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", () => {}); // suppress default error logs (handled by retryStrategy)

module.exports = redis;
