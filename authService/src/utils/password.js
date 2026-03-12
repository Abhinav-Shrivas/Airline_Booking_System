const bcrypt= require("bcrypt");
const {SALT} = require("../config/serverConfig");

const hashPassword = async(plainPassword)=>{
    try {
        const hash = await bcrypt.hash(plainPassword,SALT);
        return hash;
    } catch (error) {
        console.log("error occured in hashPassword function");
        throw error;
    }
}

const comparePassword = async(password,hashedPassword)=>{
    try {
        const result = await bcrypt.compare(password,hashedPassword);
        return result;
    } catch (error) {
        console.log("error occured in hashPassword function");
        throw error;
    }
}

module.exports = {
    hashPassword,
    comparePassword
}