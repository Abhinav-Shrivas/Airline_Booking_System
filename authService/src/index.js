const express = require("express");
const cookieParser = require("cookie-parser");
const { PORT } = require("./config/serverConfig");
const { User, Role } = require('./models');
const apiRoutes = require("./routes/index.js");
require("./jobs/clean-expired-sessions");

const setAndStartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/api", apiRoutes);

  app.listen(PORT, async () => {
    console.log(`Server running on port : ${PORT}`);
  });
};
setAndStartServer();
