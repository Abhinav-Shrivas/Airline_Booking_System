const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT, RABBITMQ_URL } = require("./config/serverConfig");
const { requestMiddleware, errorMiddleware, logger, connectQueue } = require("shared");
const bookingConsumer = require("./consumers/booking.consumer");
const apiRoutes = require("./routes");
require("./jobs/departureReminder");

const setAndStartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(requestMiddleware);
  app.use("/api", apiRoutes);
  app.use(errorMiddleware);

  // Initialize RabbitMQ consumer
  try {
    const channel = await connectQueue(RABBITMQ_URL);
    await bookingConsumer.startConsumer(channel);
    logger.info("RabbitMQ consumer started — listening for booking events");
  } catch (error) {
    logger.error(`Failed to start RabbitMQ consumer: ${error.message}`);
  }

  app.listen(PORT, () => {
    logger.info(`Notification Service running on port: ${PORT}`);
  });
};

setAndStartServer();