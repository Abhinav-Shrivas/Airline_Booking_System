const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'app-service',
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),

  transports: [
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    // All logs
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Console logs in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;