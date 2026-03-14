const nodemailer = require("nodemailer");
const {EMAIL_PASS, EMAIL_USER} = require("../config/serverConfig")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

module.exports = transporter;