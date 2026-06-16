const axios = require("axios");
const { BOOKING_SERVICE_URL, INTERNAL_API_KEY } = require("../config/serverConfig");
const { logger } = require("shared");

const bookingAPI = axios.create({
  baseURL: `${BOOKING_SERVICE_URL}/api/v1/internal`,
  headers: { "x-internal-api-key": INTERNAL_API_KEY },
  timeout: 10000,
});

const getUpcomingBookings = async (hoursUntilDeparture = 24) => {
  try {
    const response = await bookingAPI.get("/bookings/upcoming", {
      params: { hoursUntilDeparture },
    });
    return response.data.data;
  } catch (error) {
    logger.error(`Failed to fetch upcoming bookings: ${error.message}`);
    return [];  // Don't crash the cron — return empty
  }
};

const getBookingById = async (id) => {
  try {
    const response = await bookingAPI.get(`/bookings/${id}`);
    return response.data.data;
  } catch (error) {
    logger.error(`Failed to fetch booking with given id: ${error.message}`);
    return [];  // Don't crash the cron — return empty
  }
};

module.exports = { getUpcomingBookings, getBookingById };