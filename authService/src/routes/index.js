const express = require("express");
const router = express.Router();
const v1UserRoutes = require("./v1/v1UserRoutes");
const v1AuthRoutes = require("./v1/v1AuthRoutes");

router.use("/v1/users", v1UserRoutes);
router.use("/v1/auth", v1AuthRoutes);

module.exports = router;
