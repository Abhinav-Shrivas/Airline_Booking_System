const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT } = require("./config/serverConfig");
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
  app.use("/api", apiRoutes);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(errorMiddleware);
  
  app.listen(PORT, async () => {
    logger.info(`Server running on port : ${PORT}`);
  });
};
setAndStartServer();
