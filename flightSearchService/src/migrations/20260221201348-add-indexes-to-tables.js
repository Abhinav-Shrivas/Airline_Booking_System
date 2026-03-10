"use strict";

const INDEX_NAME = "flights_search_composite_idx";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Composite index for flight search
    await queryInterface.addIndex(
      "Flights",
      ["departure_airport_id", "arrival_airport_id", "departureTime"],
      { name: INDEX_NAME },
    );
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex("Flights", INDEX_NAME);
    } catch (err) {
      console.log(`Index ${INDEX_NAME} does not exist, skipping removal.`);
    }
  },
};

