const axios = require("axios");
const { FLIGHT_SERVICE_URL } = require("../config/serverConfig");
const { AppError } = require("shared");
const { logger } = require("shared");

const flightServiceAPI = axios.create({
  baseURL: `${FLIGHT_SERVICE_URL}/api/v1/flights`,
  timeout: 5000,
});

const getFlightById = async (flightId) => {
  try {
    console.log("inside the getflight function",flightId);
    const response = await flightServiceAPI.get(`/${flightId}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new AppError(`Flight with id ${flightId} not found`, 404);
    }
    throw new AppError("Flight Service unavailable", 503);
  }
};

const decrementSeats = async (flightId, count) => {
  try {
    const response = await flightServiceAPI.patch(`/${flightId}/seats`, {
      seatsToDecrement: count,
    });
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new AppError(
        error.response.data.message || "Not enough seats available",
        400,
      );
    }
    throw new AppError("Failed to reserve seats", 503);
  }
};

const incrementSeats = async (flightId, count) => {
  try {
    await flightServiceAPI.patch(`/${flightId}/seats`, {
      seatsToIncrement: count,
    });
  } catch (error) {
    // Log but don't throw — seat release failure shouldn't block cancellation
    logger.error(
      `Failed to release seats for flight ${flightId}: ${error.message}`,
    );
  }
};

module.exports = { getFlightById, decrementSeats, incrementSeats };
