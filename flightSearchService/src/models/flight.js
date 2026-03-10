"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Airport, {
        foreignKey: "departure_airport_id",
        as: "departureAirport",
        onDelete: "RESTRICT",
      });

      this.belongsTo(models.Airport, {
        foreignKey: "arrival_airport_id",
        as: "arrivalAirport",
        onDelete: "RESTRICT",
      });
    }
  }
  Flight.init(
    {
      airplane_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      flightNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      arrival_airport_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      departure_airport_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      arrivalTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      departureTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      totalSeatsLeft: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      boardingGate: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("SCHEDULED", "COMPLETED"),
        defaultValue: "SCHEDULED",
      },
      // Duration stored in minutes for efficient sorting and filtering.
      // Formatted value is exposed via virtual field.
      durationInMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      duration: {
        type: DataTypes.VIRTUAL,
        get() {
          const totalMinutes = this.getDataValue("durationInMinutes");
          if (!totalMinutes && totalMinutes !== 0) return null;

          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          if (hours === 0) return `${minutes}m`;
          if (minutes === 0) return `${hours}h`;

          return `${hours}h ${minutes}m`;
        },
      },
      departureTimeFormatted: {
        type: DataTypes.VIRTUAL,
        get() {
          const date = this.getDataValue("departureTime");
          if (!date) return null;

          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        },
      },
      arrivalTimeFormatted: {
        type: DataTypes.VIRTUAL,
        get() {
          const date = this.getDataValue("arrivalTime");
          if (!date) return null;

          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        },
      },
    },
    {
      sequelize,
      modelName: "Flight",

      // A flight cannot arrive before it departs
      validate: {
        arrivalAfterDeparture() {
          if (this.arrivalTime <= this.departureTime) {
            throw new Error("Arrival time must be after departure time");
          }
        },
      },

      // Automatically calculate duration before saving flight to ensure client cannot manipulate duration value
      hooks: {
        beforeSave: (flight, options) => {
          if (flight.departureTime && flight.arrivalTime) {
            const departure = new Date(flight.departureTime);
            const arrival = new Date(flight.arrivalTime);

            const diffMs = arrival - departure;
            const totalMinutes = Math.floor(diffMs / (1000 * 60));

            if (totalMinutes < 0) {
              throw new Error("Arrival time cannot be before departure time");
            }

            flight.durationInMinutes = totalMinutes;
          }
        },
      },
    },
  );
  return Flight;
};
