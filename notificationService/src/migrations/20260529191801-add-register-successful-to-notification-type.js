"use strict";

const { logger } = require("shared");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // In PostgreSQL, to add an enum value we use raw SQL query
    return queryInterface.sequelize.query(
      `ALTER TYPE "enum_Notifications_type" ADD VALUE 'REGISTER_SUCCESFUL';`
    ).catch(err => {
      logger.warn(`Enum value might already exist: ${err.message}`);
    });
  },

  down: async (queryInterface, Sequelize) => {
    // PostgreSQL does not support easily dropping an ENUM value. 
    // We would have to create a new type, move data, and drop the old type.
    logger.info("Removing ENUM values is not supported in Postgres.");
  }
};
