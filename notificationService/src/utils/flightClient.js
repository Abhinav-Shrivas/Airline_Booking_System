const axios = require("axios");
const { FLIGHT_SERVICE_URL, INTERNAL_API_KEY } = require("../config/serverConfig");
const { AppError, logger } = require("shared");

const flightAPI = axios.create({
  baseURL: `${FLIGHT_SERVICE_URL}/api/v1/internal`,
  headers: { "x-internal-api-key": INTERNAL_API_KEY },
  timeout: 5000,
});

const getFlightById = async (flightId) => {
  try {
    const response = await flightAPI.get(`/flights/${flightId}`);
    return response.data.data;
  } catch (error) {
    logger.error(`Failed to fetch flight ${flightId}: ${error.message}`);
    throw new AppError("Flight Service unavailable", 503);
  }
};

module.exports = { getFlightById };