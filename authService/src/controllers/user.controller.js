const userService = require("../services/user.service");
const { asyncHandler, successResponse } = require("shared");

const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.jwtPayload.userId, req.body);
  res.clearCookie("sessionToken");
  successResponse(res, {
    message: "Successfully changed the user password.",
  });
});

const fetchUser = asyncHandler(async (req, res) => {
  const data = await userService.fetch(req.params.id);
  successResponse(res, {
    message: "Successfully fetched the User.",
    data,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const data = await userService.update(req.params.id, req.body);
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

module.exports = {
  fetchUser,
  updateUser,
  deleteUser,
  changePassword,
};
