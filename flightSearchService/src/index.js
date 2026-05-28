const express = require("express");
const { PORT } = require("./config/serverConfig");
const apiRoutes = require("./routes/index.js");
const { requestMiddleware, errorMiddleware, logger } = require("shared");

const setAndStartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestMiddleware);
  app.use("/api", apiRoutes);
  app.use(errorMiddleware);

  app.listen(PORT, async () => {
    logger.info(`Server running on port : ${PORT}`);
  });
};
setAndStartServer();
