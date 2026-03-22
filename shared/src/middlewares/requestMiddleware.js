const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const requestMiddleware = (req, res, next) => {
  const requestId = uuidv4();

  req.id = requestId;

  // Log incoming request
  logger.info({
    requestId,
    method: req.method,
    url: req.originalUrl,
  });

  next();
};

module.exports = requestMiddleware;