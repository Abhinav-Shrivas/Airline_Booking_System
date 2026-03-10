"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Flights", {
      fields: ["airplane_id"],
      type: "foreign key",
      name: "fk_flights_airplane",
      references: {
        table: "Airplanes",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("Flights", {
      fields: ["arrival_airport_id"],
      type: "foreign key",
      name: "fk_flights_arrival_airport",
      references: {
        table: "Airports",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("Flights", {
      fields: ["departure_airport_id"],
      type: "foreign key",
      name: "fk_flights_departure_airport",
      references: {
        table: "Airports",
        field: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    const constraints = [
      "fk_flights_airplane",
      "fk_flights_arrival_airport",
      "fk_flights_departure_airport",
    ];
    for (const name of constraints) {
      try {
        await queryInterface.removeConstraint("Flights", name);
      } catch (err) {
        console.log(`Constraint ${name} does not exist, skipping removal.`);
      }
    }
  },
};
