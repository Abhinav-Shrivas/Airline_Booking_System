const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/serverConfig");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

async function send(to, subject, html) {
  await transporter.sendMail({
    from: `"SkyBooker ✈️" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { send };