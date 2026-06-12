const express = require("express");
const { PORT } = require("./config/serverConfig");
const apiRoutes = require("./routes/index.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
const { requestMiddleware, errorMiddleware, logger } = require("shared");

const setAndStartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestMiddleware);
  app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
  app.use("/api", apiRoutes);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(errorMiddleware);

  app.listen(PORT, async () => {
    logger.info(`Server running on port : ${PORT}`);
  });
};
setAndStartServer();
