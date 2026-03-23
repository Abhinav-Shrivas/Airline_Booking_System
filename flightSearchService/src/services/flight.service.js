const { FlightRepository, CityRepository } = require("../repositories/index");
const CrudService = require("../services/crud.service");
const { AppError } = require("shared");

const flightRepository = new FlightRepository();
const cityRepository = new CityRepository();

class FlightService extends CrudService {
  constructor() {
    super(flightRepository);
  }
  async getFlights(filters) {
    const isRoundTrip = filters.trip === "round";
    const limit = filters.moreFlights === "yes" ? null : 5;
    const order =
      filters.sort === "price"
        ? [["price", "ASC"]]
        : [["durationInMinutes", "ASC"]];

    //city can have multiple airports

    const [city1, city2] = await Promise.all([
      cityRepository.fetch(filters.to),
      cityRepository.fetch(filters.from),
    ]);

    if (!city1) throw new AppError(`City not found: ${filters.to}`, 404);
    if (!city2) throw new AppError(`City not found: ${filters.from}`, 404);

    let [arrivingAirportIds, departureAirportIds] = await Promise.all([
      city1.getAirports({
        attributes: ["id"],
        raw: true,
      }),
      city2.getAirports({
        attributes: ["id"],
        raw: true,
      }),
    ]);

    arrivingAirportIds = arrivingAirportIds.map((a) => a.id);
    departureAirportIds = departureAirportIds.map((a) => a.id);

    let data;

    // preparing newFilters which will be passed to the repository
    let newFilters = {
      arrivingAirportIds: arrivingAirportIds,
      departureAirportIds: departureAirportIds,
      totalSeatsLeft: filters.noOfSeats,
      startDay: new Date(new Date(filters.departureDate).setHours(0, 0, 0, 0)),
      endDay: new Date(
        new Date(filters.departureDate).setHours(23, 59, 59, 999),
      ),
      limit,
      order,
    };

    if (!isRoundTrip) {
      data = await flightRepository.getFlights(newFilters);
    } else {
      const returnFilters = {
        ...newFilters,
        arrivingAirportIds: departureAirportIds,
        departureAirportIds: arrivingAirportIds,
        startDay: new Date(new Date(filters.returnDate).setHours(0, 0, 0, 0)),
        endDay: new Date(
          new Date(filters.returnDate).setHours(23, 59, 59, 999),
        ),
      };

      const [goingData, returnData] = await Promise.all([
        flightRepository.getFlights(newFilters),
        flightRepository.getFlights(returnFilters),
      ]);
      data = { goingData, returnData };
    }
    return data;
  }
}

module.exports = new FlightService();
