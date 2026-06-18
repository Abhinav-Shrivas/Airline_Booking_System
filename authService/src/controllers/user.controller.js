const { SESSION_COOKIE_NAME } = require("../config/serverConfig");
const userService = require("../services/user.service");
const { asyncHandler, successResponse, AppError } = require("shared");

const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.jwtPayload.userId, req.body);
  res.clearCookie("sessionToken");
  successResponse(res, {
    message: "Successfully changed the user password.",
  });
});

const fetchUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const { userId, roles } = req.jwtPayload;
  if (targetId !== userId && !roles.includes("ADMIN")) {
    throw new AppError("You can only view your own profile", 403);
  }
  const data = await userService.fetch(targetId);
  successResponse(res, {
    message: "Successfully fetched the User.",
    data,
  });
});

// Internal: no JWT ownership check — secured by API key middleware
const fetchUserInternal = asyncHandler(async (req, res) => {
  const data = await userService.fetch(req.params.id);
  successResponse(res, {
    message: "Successfully fetched the User.",
    data,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const { userId, roles } = req.jwtPayload;
  if (targetId !== userId && !roles.includes("ADMIN")) {
    throw new AppError("You can only update your own profile", 403);
  }
  const data = await userService.update(targetId, req.body);
  successResponse(res, {
    message: "Successfully updated the User.",
    data,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const data = await userService.destroy(req.params.id);
  successResponse(res, {
    message: "Successfully deleted the User.",
    data,
  });
});

const deleteOwnUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const { userId } = req.jwtPayload;
  
  if (targetId !== userId) {
    throw new AppError("You can only delete your own account", 403);
  }
  
  await userService.destroy(targetId);
  res.clearCookie(SESSION_COOKIE_NAME);
  successResponse(res, {
    message: "Successfully deleted your account.",
  });
});

module.exports = {
  fetchUser,
  fetchUserInternal,
  updateUser,
  deleteUser,
  deleteOwnUser,
  changePassword,
};
