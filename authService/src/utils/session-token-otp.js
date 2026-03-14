const crypto = require("crypto");

function generateSessionToken() {
  return crypto.randomBytes(40).toString("hex");
}

function generateOtp() {
  return crypto.randomInt(100000, 999999);
}

function generateUuid(){
  return crypto.randomUUID();
}


function hashToken(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

module.exports = {
  generateSessionToken,
  generateOtp,
  hashToken,
  generateUuid,
};