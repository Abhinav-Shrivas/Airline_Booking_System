const AppError = require('./src/errors/appError');
const errorMiddleware = require('./src/middlewares/errorMiddleware');
const requestMiddleware = require('./src/middlewares/requestMiddleware');
const validate = require('./src/middlewares/validate');
const authMiddleware = require('./src/middlewares/auth-middleware');
const authorizeMiddleware = require('./src/middlewares/authorize');
const asyncHandler = require('./src/utils/asyncHandler');
const logger = require('./src/utils/logger');
const verifyAccessToken = require('./src/utils/verifyToken');
const { successResponse } = require('./src/utils/responseHandler');

module.exports = {
  AppError,
  errorMiddleware,
  requestMiddleware,
  asyncHandler,
  logger,
  successResponse,
  validate,
  authMiddleware,
  authorizeMiddleware,
  verifyAccessToken
};
