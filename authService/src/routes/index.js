const express = require("express");
const router = express.Router();
const v1UserRoutes = require("./v1/v1UserRoutes");
const v1AuthRoutes = require("./v1/v1AuthRoutes");
const v1AdminRoutes = require("./v1/v1AdminRoutes");
const v1InternalRoutes = require("./v1/v1InternalRoutes");

router.use("/v1/users", v1UserRoutes);
router.use("/v1/auth", v1AuthRoutes);
router.use("/v1/internal", v1InternalRoutes);
router.use("/v1/admin", v1AdminRoutes);

module.exports = router;
