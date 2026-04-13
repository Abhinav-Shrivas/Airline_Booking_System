const PaymentService  = require("../services/payment.service");
const { asyncHandler, successResponse } = require("shared");

const initiatePayment = asyncHandler(async (req, res) => {
  const data = await PaymentService.initiatePayment(
    req.body.bookingId,
    req.jwtPayload.userId
  );
  successResponse(res, { data, message: "Payment processed.", statusCode: 201 });
});

const getPaymentByBooking = asyncHandler(async (req, res) => {
  const data = await PaymentService.getPaymentByBooking(
    parseInt(req.params.bookingId),
    req.jwtPayload.userId
  );
  successResponse(res, { data, message: "Payment details fetched." });
});

module.exports = { initiatePayment, getPaymentByBooking };
