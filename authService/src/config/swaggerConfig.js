const swaggerJsdoc = require('swagger-jsdoc');
const { PORT } = require('./serverConfig');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication and user management APIs for Airline Booking Backend',
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`,
        description: process.env.RENDER_EXTERNAL_URL ? 'Production server' : 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-internal-api-key',
        },
      },
    },
  },
  apis: ['./src/routes/v1/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
