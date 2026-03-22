// authService/src/validations/auth.validation.js
const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const sendOtp = Joi.object({
  email: Joi.string().email().required(),
});

const verifyOtp = Joi.object({
  otpId: Joi.string().uuid().required(),
  otp: Joi.number().integer().required(),
});

const resetPassword = Joi.object({
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = { register, login, sendOtp, verifyOtp, resetPassword };
