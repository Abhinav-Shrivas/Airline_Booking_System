const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT } = require("./config/serverConfig");
const { requestMiddleware, errorMiddleware, logger } = require("shared");
const apiRoutes = require("./routes/index.js");
require("./jobs/expire-bookings");

const setAndStartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser()); 

  app.use(requestMiddleware);
  app.use("/api", apiRoutes);
  app.use(errorMiddleware);

  app.listen(PORT, async () => {
    logger.info(`Booking Service running on port: ${PORT}`);
  });
};
setAndStartServer();
