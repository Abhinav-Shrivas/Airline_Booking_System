"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {}

  Notification.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      bookingId: { type: DataTypes.INTEGER, allowNull: true },
      type: {
        type: DataTypes.ENUM(
          "BOOKING_CONFIRMED",
          "BOOKING_CANCELLED",
          "BOOKING_REFUNDED",
          "BOOKING_EXPIRED",
          "PAYMENT_FAILED",
          "DEPARTURE_REMINDER",
        ),
        allowNull: false,
      },
      channel: {
        type: DataTypes.ENUM("EMAIL", "SMS", "PUSH"),
        defaultValue: "EMAIL",
        allowNull: false,
      },
      recipientEmail: { type: DataTypes.STRING, allowNull: false },
      subject: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM("PENDING", "SENT", "FAILED"),
        defaultValue: "PENDING",
        allowNull: false,
      },
      sentAt: { type: DataTypes.DATE, allowNull: true },
      failReason: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: "Notification",
    },
  );
  return Notification;
};