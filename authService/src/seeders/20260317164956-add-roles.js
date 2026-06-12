"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        name: "USER",
        description: "Default role for customers booking flights",
      },
      {
        name: "ADMIN",
        description: "System administrator with full access",
      },
      {
        name: "AIRLINE_STAFF",
        description: "Manages flights and airline operations",
      },
      {
        name: "SUPPORT_AGENT",
        description: "Handles customer issues and support",
      },
    ];

    for (const role of roles) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM "Roles" WHERE name = '${role.name}'`,
      );
      if (existing.length === 0) {
        await queryInterface.bulkInsert("Roles", [
          {
            name: role.name,
            description: role.description,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Roles", {
      name: ["USER", "ADMIN", "AIRLINE_STAFF", "SUPPORT_AGENT"],
    });
  },
};
