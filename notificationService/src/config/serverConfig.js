const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
  FLIGHT_SERVICE_URL: process.env.FLIGHT_SERVICE_URL,
  BOOKING_SERVICE_URL: process.env.BOOKING_SERVICE_URL ,
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};