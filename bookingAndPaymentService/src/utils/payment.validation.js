const Joi = require("joi");

const initiatePayment = Joi.object({
  bookingId: Joi.number().integer().required(),
});

module.exports = { initiatePayment };
