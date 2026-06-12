"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM "Airplanes" LIMIT 1`,
    );
    if (existing.length > 0) return;

    await queryInterface.bulkInsert(
      "Airplanes",
      [
        {
          ModelNo: "A320-001",
          capacity: 150,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A320-002",
          capacity: 150,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A321-001",
          capacity: 185,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A321-002",
          capacity: 185,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B737-800-001",
          capacity: 162,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B737-800-002",
          capacity: 162,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B737-900-001",
          capacity: 215,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B777-300-001",
          capacity: 365,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B787-8-001",
          capacity: 242,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B787-9-001",
          capacity: 290,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A330-300-001",
          capacity: 295,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A330-200-001",
          capacity: 250,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "E190-001",
          capacity: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "CRJ900-001",
          capacity: 90,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "ATR72-001",
          capacity: 70,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "DH8D-001",
          capacity: 78,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A350-900-001",
          capacity: 325,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A350-1000-001",
          capacity: 366,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B747-400-001",
          capacity: 416,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "Regional-001",
          capacity: 44,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A320-003",
          capacity: 150,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A320-004",
          capacity: 150,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A321-003",
          capacity: 185,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B737-800-003",
          capacity: 162,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B737-800-004",
          capacity: 162,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A330-300-002",
          capacity: 295,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "B787-8-002",
          capacity: 242,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ModelNo: "A350-900-002",
          capacity: 325,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Airplanes", null, {});
  },
};
