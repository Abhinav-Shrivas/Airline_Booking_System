const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT, RABBITMQ_URL } = require("./config/serverConfig");
const { requestMiddleware, errorMiddleware, logger, connectQueue } = require("shared");
const bookingConsumer = require("./consumers/booking.consumer");
const authConsumer = require("./consumers/auth.consumer");
const apiRoutes = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
require("./jobs/departureReminder");

const setAndStartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(requestMiddleware);
  app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
  app.use("/api", apiRoutes);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(errorMiddleware);

  // Initialize RabbitMQ consumer
  try {
    const channel = await connectQueue(RABBITMQ_URL);
    await bookingConsumer.startConsumer(channel);
    await authConsumer.startConsumer(channel);
    logger.info("RabbitMQ consumer started — listening for booking events");
  } catch (error) {
    logger.error(`Failed to start RabbitMQ consumer: ${error.message}`);
  }

  app.listen(PORT, () => {
    logger.info(`Notification Service running on port: ${PORT}`);
  });
};

setAndStartServer();