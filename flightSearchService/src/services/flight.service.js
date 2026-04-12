const {
  FlightRepository,
  CityRepository,
  AirplaneRepository,
} = require("../repositories/index");
const { sequelize } = require("../models/index");
const CrudService = require("../services/crud.service");
const { AppError } = require("shared");

const flightRepository = new FlightRepository();
const airplaneRepository = new AirplaneRepository();
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
      data = data.map((flight) => ({
        ...flight,
        totalPrice: flight.price * parseInt(filters.noOfSeats, 10),
      }));
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
      const seats = parseInt(filters.noOfSeats, 10);

      data = {
        outboundFlights: goingData.map((f) => ({
          ...f,
          totalPrice: f.price * seats,
        })),
        returnFlights: returnData.map((f) => ({
          ...f,
          totalPrice: f.price * seats,
        })),
      };
    }
    return data;
  }

  async decrementSeats(flightId, count) {
    // using seatlocking and transaction
    // await sequelize.transaction(async (t) => {
    //   const flight = await Flight.findByPk(id, {   //id and noOfSeatsfrom params
    //     transaction: t,
    //     lock: t.LOCK.UPDATE,
    //   });

    //   if (flight.totalSeatsLeft < noOfSeats) {
    //     throw new AppError("Not enough seats", 409);
    //   }

    //   await flight.update(
    //     { totalSeatsLeft: flight.totalSeatsLeft - noOfSeats },
    //     { transaction: t },
    //   );
    // });
    const affectedRows = await flightRepository.decrementSeats(flightId, count);
    if (affectedRows === 0) {
      throw new AppError("Not enough seats available or flight not found", 400);
    }
    return true;
  }

  async incrementSeats(flightId, count) {
    if (count <= 0) {
      throw new AppError("Invalid seat count", 400);
    }
    return await sequelize.transaction(async (t) => {
      const flight = await flightRepository.fetch(flightId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      const airplane = await airplaneRepository.fetch(flight.airplane_id, {
        transaction: t,
      });
      const newSeats = parseInt(flight.totalSeatsLeft) + parseInt(count);
      if (newSeats > airplane.capacity) {
        throw new AppError("Capacity exceeded", 409);
      }
      await flightRepository.update(
        flightId,
        { totalSeatsLeft: newSeats },
        { transaction: t },
      );

      return { success: true };
    });
  }
}

module.exports = new FlightService();
