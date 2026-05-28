const axios = require("axios");
const { AUTH_SERVICE_URL, INTERNAL_API_KEY } = require("../config/serverConfig");
const { AppError, logger } = require("shared");

const authAPI = axios.create({
  baseURL: `${AUTH_SERVICE_URL}/api/v1/internal`,
  headers: { "x-internal-api-key": INTERNAL_API_KEY },
  timeout: 5000,
});

const getUserById = async (userId) => {
  try {
    const response = await authAPI.get(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    logger.error(`Failed to fetch user ${userId}: ${error.message}`);
    throw new AppError("Auth Service unavailable", 503);
  }
};

module.exports = { getUserById };