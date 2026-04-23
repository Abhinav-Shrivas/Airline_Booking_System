const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5003,
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || "dev-internal-key-12345",
  FLIGHT_SERVICE_URL: process.env.FLIGHT_SERVICE_URL || "http://localhost:3002",
};
