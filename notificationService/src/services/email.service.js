const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const { EMAIL_USER, EMAIL_PASS } = require("../config/serverConfig");
const { logger } = require("shared");

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Resend (HTTPS) for production/Render, Nodemailer (SMTP) for local/Docker
let resend;
let transporter;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  logger.info("Email provider: Resend (HTTPS)");
} else {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  logger.info("Email provider: Nodemailer/Gmail (SMTP)");
}

async function send(to, subject, html) {
  if (resend) {
    await resend.emails.send({
      from: "SkyBooker ✈️ <noreply@skybooker.xyz>",
      to,
      subject,
      html,
    });
  } else {
    await transporter.sendMail({
      from: `SkyBooker ✈️ <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }
}

module.exports = { send };