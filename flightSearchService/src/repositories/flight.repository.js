const { Op } = require("sequelize");
const { Flight, sequelize } = require("../models/index");
const CrudRepository = require("./crud.repository");

class FlightRepository extends CrudRepository {
  constructor() {
    super(Flight);
  }
  async getFlights(filters) {
    const response = await Flight.findAll({
      where: {
        arrival_airport_id: {
          [Op.in]: filters.arrivingAirportIds,
        },
        departure_airport_id: {
          [Op.in]: filters.departureAirportIds,
        },
        totalSeatsLeft: {
          [Op.gte]: filters.totalSeatsLeft,
        },
        departureTime: {
          [Op.between]: [filters.startDay, filters.endDay],
        },
      },
      limit: filters.limit,
      order: filters.order,
    });
    return response;
  }

  async decrementSeats(flightId, count) {
    const [affectedRows] = await Flight.update(
      {
        totalSeatsLeft: sequelize.literal(
          `totalSeatsLeft - ${parseInt(count,10)}`,
        ),
      },
      {
        where: {
          id: flightId,
          totalSeatsLeft: { [Op.gte]: count }, // Only if enough seats
        },
      },
    );
    return affectedRows;
  }
}

module.exports = FlightRepository;
