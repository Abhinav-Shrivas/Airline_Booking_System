const jwt = require("jsonwebtoken");
const {JWT_SECRET_KEY} = require("../config/serverConfig");

function generateAccessToken(payload){
    return jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn : "15m"
    });
};

function generateResetToken(email){
     return jwt.sign({
        email,
        purpose : "password-reset",
     }, JWT_SECRET_KEY, {
        expiresIn : "10m"
    });
}

function verifyAccessToken(token){
    return jwt.verify(token,JWT_SECRET_KEY);
}

module.exports = {
    generateAccessToken,
    verifyAccessToken,  
    generateResetToken
}