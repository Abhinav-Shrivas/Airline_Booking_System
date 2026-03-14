const transporter = require("./mailTransporter");
const {EMAIL_USER} = require("../config/serverConfig");

async function sendEmail(toEmail, subject, text) {
  const mailOptions = {
    from: EMAIL_USER,
    to: toEmail,
    subject,
    text
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;