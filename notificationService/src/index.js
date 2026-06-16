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

  // CORS — allow frontend origins
  app.use((req, res, next) => {
    const extraOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
      ...extraOrigins
    ].filter(Boolean);
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

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