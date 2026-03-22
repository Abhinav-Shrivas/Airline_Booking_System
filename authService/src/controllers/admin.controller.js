const userService = require("../services/user.service");
const { asyncHandler, successResponse } = require("shared");

const assignRole = asyncHandler(async (req, res) => {
  const data = await userService.assignRole(req.body);
  successResponse(res, {
    message: "Successfully assigned the role to the user.",
    data,
  });
});

const updateRole =  asyncHandler(async (req, res) => {
  const data = await userService.updateRole(req.body);
  successResponse(res, {
    message: "Successfully updated the role of the user.",
    data,
  });
});


module.exports = {
    assignRole,
    updateRole
}