const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT, NOTIFICATION_SERVICE_URL } = require("./config/serverConfig");
const { requestMiddleware, errorMiddleware, logger } = require("shared");
const apiRoutes = require("./routes/index.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
const eventPublisher = require("./utils/eventPublisher.js");
require("./jobs/clean-expired-sessions");

const setAndStartServer = async () => {
  await eventPublisher.init();
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // CORS — allow frontend origins with credentials (HttpOnly cookies)
  app.use((req, res, next) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://localhost:3000",
      process.env.FRONTEND_URL,
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
  
  app.listen(PORT, async () => {
    logger.info(`Server running on port : ${PORT}`);

    // Wake up the notification service on render (fire-and-forget)
    if (NOTIFICATION_SERVICE_URL) {
      fetch(`${NOTIFICATION_SERVICE_URL}/health`).catch(() => {});
    }
  });
};
setAndStartServer();
