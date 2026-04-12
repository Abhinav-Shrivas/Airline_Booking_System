"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Booking,{
        foreignKey : "bookingId",
        as : "payment",
        onDelete : "CASCADE"
      })
    }
  }
  Payment.init(
    {
      bookingId: { type: DataTypes.INTEGER, allowNull: false, unique : true },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
        defaultValue: "PENDING",
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.ENUM("CARD", "UPI", "NETBANKING", "WALLET"),
        defaultValue: "UPI",
        allowNull: false,
      },
      gateway: { type: DataTypes.STRING, allowNull: false, defaultValue:"MOCK" },
      paidAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Payment",
    },
  );
  return Payment;
};
