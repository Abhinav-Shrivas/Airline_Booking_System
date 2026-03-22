const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin.controller");
const {
  authMiddleware,
  authorizeMiddleware
} = require("../../middlewares/index");

router.post("/assignRole",authMiddleware, authorizeMiddleware("ADMIN"), adminController.assignRole);
router.patch("/updateRole",authMiddleware, authorizeMiddleware("ADMIN"), adminController.updateRole);

module.exports = router;