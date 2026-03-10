"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Flights", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      airplane_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      flightNo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      arrival_airport_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      departure_airport_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalSeatsLeft: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      arrivalTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      departureTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("SCHEDULED", "COMPLETED"),
        allowNull: false,
        defaultValue: "SCHEDULED",
      },
      boardingGate: {
        type: Sequelize.STRING,
      },
      durationInMinutes: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Flights");
  },
};
