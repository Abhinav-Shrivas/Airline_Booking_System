"use strict";

const { logger } = require("shared");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // In PostgreSQL, to add an enum value we use raw SQL query
    return queryInterface.sequelize.query(
      `ALTER TYPE "enum_Notifications_type" ADD VALUE 'BOOKING_CANCELLED_NO_REFUND';`
    ).catch(err => {
      logger.warn(`Enum value might already exist: ${err.message}`);
    });
  },

  down: async (queryInterface, Sequelize) => {
    logger.info("Removing ENUM values is not supported in Postgres.");
  }
};
