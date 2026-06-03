const express = require("express");
const router = express.Router();
const v1NotificationRoutes = require("./v1/v1NotificationRoutes");

router.use("/v1/notifications", v1NotificationRoutes);

module.exports = router;
