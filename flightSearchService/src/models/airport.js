"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Airport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.City, {
        foreignKey: "city_id",
        onDelete: "CASCADE",
      });
      this.hasMany(models.Flight, {
        foreignKey: "arrival_airport_id",
        as: "arrivingFlights",
      });

      this.hasMany(models.Flight, {
        foreignKey: "departure_airport_id",
        as: "departingFlights",
      });
    }
  }
  Airport.init(
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      city_id: { type: DataTypes.INTEGER, allowNull: false },
      address: {
        type: DataTypes.STRING,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Airport",
    },
  );
  return Airport;
};
