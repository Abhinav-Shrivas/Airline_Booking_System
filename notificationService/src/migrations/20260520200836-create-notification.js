'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      bookingId: { type: Sequelize.INTEGER, allowNull: true },
      type: {
        type: Sequelize.ENUM(
          "BOOKING_CONFIRMED", "BOOKING_CANCELLED", "BOOKING_REFUNDED",
          "BOOKING_EXPIRED", "PAYMENT_FAILED", "DEPARTURE_REMINDER",
        ),
        allowNull: false,
      },
      channel: {
        type: Sequelize.ENUM("EMAIL", "SMS", "PUSH"),
        defaultValue: "EMAIL",
        allowNull: false,
      },
      recipientEmail: { type: Sequelize.STRING, allowNull: false },
      subject: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM("PENDING", "SENT", "FAILED"),
        defaultValue: "PENDING",
        allowNull: false,
      },
      sentAt: { type: Sequelize.DATE, allowNull: true },
      failReason: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Notifications");
  }
};
