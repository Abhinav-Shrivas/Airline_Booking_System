"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "Bookings",
      "flightId",
      "outboundFlightId"
    );

    await queryInterface.addColumn("Bookings", "returnFlightId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Bookings", "tripType", {
      type: Sequelize.ENUM("ONE_WAY", "ROUND_TRIP"),
      allowNull: false,
      defaultValue: "ONE_WAY",
    });

    await queryInterface.addColumn("Bookings", "flightSnapshot", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Bookings", "flightSnapshot");

    await queryInterface.removeColumn("Bookings", "tripType");

    await queryInterface.removeColumn("Bookings", "returnFlightId");

    await queryInterface.renameColumn(
      "Bookings",
      "outboundFlightId",
      "flightId"
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Bookings_tripType";'
    );
  },
};