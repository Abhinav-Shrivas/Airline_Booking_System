const Joi = require("joi");

// Airplane
const createAirplane = Joi.object({
  modelNo: Joi.string().trim().required(),
  capacity: Joi.number().integer().min(1).required(),
});

// Airport
const createAirport = Joi.object({
  name: Joi.string().trim().required(),
  city_id: Joi.number().integer().required(),
  address: Joi.string().trim().optional(),
});

// City
const createCity = Joi.object({
  name: Joi.string().trim().required(),
});

// Flight
const createFlight = Joi.object({
  airplane_id: Joi.number().integer().required(),
  flightNo: Joi.string().trim().required(),
  price: Joi.number().integer().min(0).required(),
  arrival_airport_id: Joi.number().integer().required(),
  departure_airport_id: Joi.number().integer().required(),
  arrivalTime: Joi.date().iso().required(),
  departureTime: Joi.date().iso().required(),
  totalSeatsLeft: Joi.number().integer().min(0).required(),
  boardingGate: Joi.string().optional(),
});

// Flight search (GET /flights)
const searchFlights = Joi.object({
  to: Joi.number().integer().required(),
  from: Joi.number().integer().required(),
  departureDate: Joi.date().iso().required(),
  noOfSeats: Joi.number().integer().min(1).required(),
  trip: Joi.string().valid("one-way", "round").default("one-way"),
  returnDate: Joi.when("trip", {
    is: "round",
    then: Joi.date()
      .iso()
      .greater(Joi.ref("departureDate"))
      .required()
      .messages({ "date.greater": "Return date must be after departure date" }),
    otherwise: Joi.optional(),
  }),
  sort: Joi.string().valid("price", "duration").default("price"),
  moreFlights: Joi.string().valid("yes", "no").default("no"),
});

module.exports = {
  createAirplane,
  createAirport,
  createCity,
  createFlight,
  searchFlights,
};
