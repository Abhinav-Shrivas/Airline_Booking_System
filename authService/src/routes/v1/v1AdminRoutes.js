const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin.controller");
const authMiddleware = require("../../middlewares/auth-middleware");
const authorize = require("../../middlewares/authorize");

router.post("/assignRole",authMiddleware, authorize("ADMIN"), adminController.assignRole);
router.patch("/updateRole",authMiddleware, authorize("ADMIN"), adminController.updateRole);

module.exports = router;