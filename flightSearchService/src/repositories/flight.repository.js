const { Op } = require("sequelize");
const { Flight } = require("../models/index");
const CrudRepository = require("./crud.repository");

class FlightRepository extends CrudRepository {
  constructor() {
    super(Flight);
  }
  async getFlights(filters) {
    try {
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
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }
}

module.exports = FlightRepository;
