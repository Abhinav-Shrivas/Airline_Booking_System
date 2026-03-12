"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const { SALT } = require("../config/serverConfig");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 300],
        },
      },
    },
    {
      sequelize,
      modelName: "User",

      //Hashes the password before saving to the db
      hooks: {
        beforeSave: async (user, options) => {
          const plainPassword = user.password;
          try {
            const hash = await bcrypt.hash(plainPassword, SALT);
            user.password = hash;
          } catch (error) {
            console.log(error);
            throw error;
          }
        },
      },
    },
  );
  return User;
};
