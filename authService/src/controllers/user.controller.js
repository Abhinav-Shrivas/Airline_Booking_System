const session = require("../models/session");
const userService = require("../services/user.service");

const registerUser = async (req, res) => {
  try {
    const data = await userService.register(req.body);
    return res.status(201).json({
      data: data,
      success: true,
      message: "Successfully created the Airplane",
      error: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller",
      error: error,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await userService.login(req.body);
    res.cookie("sessionToken", result.sessionToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, //for development it is set as false
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Login successful",
      data: {
        id: result.user.id,
        email: result.user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      data: {},
      success: false,
      message: "Something went wrong in the User controller",
      error: error,
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
      error: error,
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
      error: error,
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
      error: error,
    });
  }
};

module.exports = {
  registerUser,
  fetchUser,
  updateUser,
  deleteUser,
  login,
};
