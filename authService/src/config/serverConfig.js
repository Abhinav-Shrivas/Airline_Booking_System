const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT : process.env.PORT,
    SALT: parseInt(process.env.SALT),
    JWT_SECRET_KEY : process.env.secret_key,
    EMAIL_USER : process.env.EMAIL_USER,
    EMAIL_PASS : process.env.EMAIL_PASS,
}