'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull : false,
        onDelete : "CASCADE",
        references : {
          model : "Users",
          key : "id"
        }
      },
      tokenHash: {
        type: Sequelize.STRING,
        unique : true,
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull : false
      },
      absoluteExpiry: {
        type:Sequelize.DATE,
        allowNull : false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sessions');
  }
};