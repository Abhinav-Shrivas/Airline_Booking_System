const swaggerJsdoc = require('swagger-jsdoc');
const { PORT } = require('./serverConfig');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking and Payment API',
      version: '1.0.0',
      description: 'Booking and Payment APIs for Airline Booking Backend',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local development server',
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
