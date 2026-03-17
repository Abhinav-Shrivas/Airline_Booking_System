const userService = require("../services/user.service");

const assignRole = async (req, res) => {
  try {
    const data = await userService.assignRole(req.body);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully assigned the role to the user.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const data = await userService.updateRole(req.body);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully updated the role of the user.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};

module.exports = {
    assignRole,
    updateRole
}