const userService = require("../services/user.service");

const registerUser = async (req, res) => {
  try {
    const data = await userService.register(req.body);
    return res.status(201).json({
      data: data,
      success: true,
      message: "Successfully created the User",
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


const changePassword = async (req, res) => {
  try {
    await userService.changePassword(req.jwtPayload.userId,req.body);
    res.clearCookie("sessionToken");
    return res.status(200).json({
      success: true,
      message: "Successfully changed the user password.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in the User controller",
      error: error.message,
    });
  }
};


const fetchUser = async (req, res) => {
  try {
    const data = await userService.fetch(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully fetched the User.",
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

const updateUser = async (req, res) => {
  try {
    const data = await userService.update(req.params.id, req.body);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully updated the User.",
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

const deleteUser = async (req, res) => {
  try {
    const data = await userService.destroy(req.params.id);
    return res.status(200).json({
      data: data,
      success: true,
      message: "Successfully deleted the User.",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  fetchUser,
  updateUser,
  deleteUser,
  changePassword,
};
