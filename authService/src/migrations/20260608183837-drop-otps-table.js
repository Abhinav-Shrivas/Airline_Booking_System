'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable("Otps");
  },

  async down (queryInterface, Sequelize) {
    
  }
};
