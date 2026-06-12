//For testing adming routes i have seeded one user with role as ADMIN. Currently there is no route to directly login as ADMIN or promote to it
//currently only admin can promote other users to ADMIN ROLE 
//but
//we can create one route secured by INTERNAL_API_KEY that promotes any registered user to admin.
//credentials of user below are as follows:
/*
Email: admin@airline.com
Password: Admin@123
Role: ADMIN
*/

"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if admin already exists
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'admin@airline.com'`,
    );
    if (existing.length > 0) return;

    // Hash password (SALT = 9, matching serverConfig)
    const hashedPassword = await bcrypt.hash("Admin@123", 9);

    // Insert admin user
    await queryInterface.bulkInsert("Users", [
      {
        name: "Admin",
        email: "admin@airline.com",
        password: hashedPassword,
        provider: "local",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Get the admin user id and ADMIN role id
    const [[adminUser]] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'admin@airline.com'`,
    );
    const [[adminRole]] = await queryInterface.sequelize.query(
      `SELECT id FROM "Roles" WHERE name = 'ADMIN'`,
    );

    // Assign ADMIN role
    await queryInterface.bulkInsert("user_roles", [
      {
        user_id: adminUser.id,
        role_id: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const [[adminUser]] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'admin@airline.com'`,
    );
    if (adminUser) {
      await queryInterface.bulkDelete("user_roles", { user_id: adminUser.id });
      await queryInterface.bulkDelete("Users", { email: "admin@airline.com" });
    }
  },
};
