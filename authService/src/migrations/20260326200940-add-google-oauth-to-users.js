"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Make password nullable
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Add provider column
    await queryInterface.addColumn("Users", "provider", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "local",
    });

    // 3. Add googleId column
    await queryInterface.addColumn("Users", "googleId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "googleId");
    await queryInterface.removeColumn("Users", "provider");
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
