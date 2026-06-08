const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT : process.env.PORT,
    REDIS_URL: process.env.REDIS_URL
}