"use strict";

const CONSTRAINT_NAME = "unique_flight_per_departure";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Flights", {
      fields: ["flightNo", "departureTime"],
      type: "unique",
      name: CONSTRAINT_NAME,
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint("Flights", CONSTRAINT_NAME);
    } catch (err) {
      console.log(
        `Constraint ${CONSTRAINT_NAME} does not exist, skipping removal.`,
      );
    }
  },
};
