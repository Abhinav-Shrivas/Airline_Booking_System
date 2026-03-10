const express = require("express");
const { PORT } = require("./config/serverConfig");
const apiRoutes = require("./routes/index.js");
const setAndStartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", apiRoutes);
  app.listen(PORT, async () => {
    console.log(`Server running on port : ${PORT}`);
  });
};
setAndStartServer();
