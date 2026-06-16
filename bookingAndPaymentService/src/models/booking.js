"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Passenger, {
        foreignKey: "bookingId",
        as: "passengers",
        onDelete: "CASCADE",
      });
      this.hasOne(models.Payment, {
        foreignKey: "bookingId",
        as: "payment",
        onDelete: "CASCADE",
      });
    }
  }
  Booking.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      
      outboundFlightId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      returnFlightId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      tripType: {
        type: DataTypes.ENUM("ONE_WAY", "ROUND_TRIP"),
        allowNull: false,
        defaultValue: "ONE_WAY",
      },

      flightSnapshot: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      noOfSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 10 },
      },
      totalCost: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM(
          "INITIATED",
          "PENDING",
          "CONFIRMED",
          "CANCELLED",
          "EXPIRED",
        ),
        defaultValue: "INITIATED",
        allowNull: false,
      },
      bookedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Booking",
    },
  );
  return Booking;
};
