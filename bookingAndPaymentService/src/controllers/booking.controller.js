const BookingService  = require("../services/booking.service");
const { asyncHandler, successResponse } = require("shared");

const createBooking = asyncHandler(async (req, res) => {
  const userId = req.jwtPayload.userId; // from authMiddleware
  const data = await BookingService.createBooking(userId, req.body);
  successResponse(res, {
    data,
    message: "Booking created successfully. Complete payment within 10 minutes.",
    statusCode: 201,
  });
});

const getBooking = asyncHandler(async (req, res) => {
  const data = await BookingService.getBooking(
    parseInt(req.params.id),
    req.jwtPayload.userId
  );
  successResponse(res, { data, message: "Booking fetched successfully." });
});

const getUserBookings = asyncHandler(async (req, res) => {
  const data = await BookingService.getBookingsByUser(req.jwtPayload.userId);
  successResponse(res, {
    data,
    message: "User bookings fetched successfully.",
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const data = await BookingService.cancelBooking(
    parseInt(req.params.id),
    req.jwtPayload.userId
  );
  successResponse(res, { data, message: "Booking cancelled successfully." });
});

module.exports = { createBooking, getBooking, getUserBookings, cancelBooking };
