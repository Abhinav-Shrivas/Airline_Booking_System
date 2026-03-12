const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
// const authMiddleware = require("../../middlewares/auth-middleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.post("/refresh",userController.refresh);
router.delete("/:id", userController.deleteUser);
router.patch("/:id", userController.updateUser);
// router.get("/testing", authMiddleware, (req, res) => {
//  return res.status(200).json({
//     data: req.user,
//     success: true,
//     message: "User is verified",
//     error: {},
//   });
// });

router.get("/:id", userController.fetchUser);

module.exports = router;
