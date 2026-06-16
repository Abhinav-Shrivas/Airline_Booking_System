const Joi = require("joi");

const createBooking = Joi.object({
  flightId: Joi.number().integer().required(),
  noOfSeats: Joi.number().integer().min(1).max(10).required(),
  passengers: Joi.array()
    .items(
      Joi.object({
        fullName: Joi.string().trim().min(1).max(50).required(),
        age: Joi.number().integer().min(0).max(150).optional(),
        seatNo: Joi.string().trim().max(5).optional(),
      })
    )
    .min(1)
    .required(),
});

const createBookingRound = Joi.object({
  outboundFlightId: Joi.number().integer().required(),

  returnFlightId: Joi.number()
    .integer()
    .required()
    .invalid(Joi.ref("outboundFlightId"))
    .messages({
      "any.invalid":
        "returnFlightId must be different from outboundFlightId",
    }),

  noOfSeats: Joi.number().integer().min(1).max(10).required(),

  passengers: Joi.array()
    .items(
      Joi.object({
        fullName: Joi.string().trim().min(1).max(50).required(),

        age: Joi.number().integer().min(0).max(150).optional(),

        seatNo: Joi.string().trim().max(5).optional(),
      })
    )
    .min(1)
    .required(),
});

module.exports = { createBooking, createBookingRound };
