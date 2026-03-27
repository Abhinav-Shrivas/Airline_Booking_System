"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../utils/password");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Session, {
        foreignKey: "userId",
      });
      this.belongsToMany(models.Role, {
        through: "user_roles",
        foreignKey: "user_id",
        otherKey: "role_id",
        as: "roles",
      });
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
        allowNull: true,
        validate: {
          len: [6, 300],
        },
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "local",
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "User",

      //Hashes the password before saving to the db
      hooks: {
        beforeSave: async (user, options) => {
          if (user.password && user.changed("password")) {
            const plainPassword = user.password;
            user.password = await hashPassword(plainPassword);
          }
        },
      },
    },
  );
  return User;
};
