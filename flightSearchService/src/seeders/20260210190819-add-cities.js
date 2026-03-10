"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Cities",
      [
        {
          name: "Delhi",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mumbai",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bengaluru",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Chennai",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Hyderabad",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kolkata",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pune",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ahmedabad",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jaipur",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Lucknow",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Chandigarh",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Indore",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bhopal",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Nagpur",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Surat",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Patna",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Coimbatore",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Visakhapatnam",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Vadodara",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ranchi",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Guwahati",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Thiruvananthapuram",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dehradun",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Darjeeling",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daman",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dibrugarh",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Durgapur",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dharamshala",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dholpur",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dindigul",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dewas",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dhubri",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dumka",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Datia",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Cities", null, {});
  },
};
