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
