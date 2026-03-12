const express = require("express");
const router = express.Router();
const v1UserRoutes = require("./v1/v1UserRoutes");

router.use("/v1/users", v1UserRoutes);

module.exports = router;
