const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  // default values
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  const errors = err.errors || [];

  // Log the error
  logger.error({
    requestId: req.id,
    message,
    statusCode,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Send response
  const response = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;


// another method to return response in short
// When errors exist
// res.json({
//   success: false,
//   message,
//   ...(errors.length > 0 && { errors })
// });

// becomes:

// {
//   "success": false,
//   "message": "...",
//   "errors": [...]
// }