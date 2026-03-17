'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('Roles', [
      {
        name: 'USER',
        description: 'Default role for customers booking flights',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ADMIN',
        description: 'System administrator with full access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'AIRLINE_STAFF',
        description: 'Manages flights and airline operations',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'SUPPORT_AGENT',
        description: 'Handles customer issues and support',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', {
      name: ['USER', 'ADMIN', 'AIRLINE_STAFF', 'SUPPORT_AGENT']
    }, {});
  }
};
