"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bookingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: "Bookings", key: "id" },
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED"),
        defaultValue: "PENDING",
        allowNull: false,
      },
      transactionId: { type: Sequelize.STRING, allowNull: true, unique: true },
      paymentMethod: {
        type: Sequelize.ENUM("CARD", "UPI", "NETBANKING", "WALLET"),
        defaultValue: "UPI",
        allowNull: false,
      },
      gateway: {
        type: Sequelize.STRING,
        defaultValue: "MOCK",
        allowNull: false,
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Payments");
  },
};
