const BookingService = require("../services/booking.service");
const { asyncHandler, successResponse } = require("shared");

const createBooking = asyncHandler(async (req, res) => {
  const userId = req.jwtPayload.userId; // from authMiddleware
  const data = await BookingService.createBooking(userId, req.body);
  successResponse(res, {
    data,
    message:
      "Booking created successfully. Complete payment within 10 minutes.",
    statusCode: 201,
  });
});

const createBookingRound = asyncHandler(async (req, res) => {
  const userId = req.jwtPayload.userId; 
  const data = await BookingService.createBookingRound(userId, req.body);
  successResponse(res, {
    data,
    message:
      "Booking created successfully. Complete payment within 10 minutes.",
    statusCode: 201,
  });
});

const refundBooking = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const userId = req.jwtPayload.userId;
  const data = await BookingService.cancelAndRefundBooking(bookingId, userId);
  successResponse(res, {
    data,
    message: "Booking cancelled and refunded successfully.",
  });
});

const adminRefundBooking = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const data = await BookingService.cancelAndRefundBooking(bookingId, null, {
    skipTimeCheck: true,
    skipOwnershipCheck: true,
  });
  successResponse(res, {
    data,
    message: "Booking cancelled and refunded by admin.",
  });
});

const getBooking = asyncHandler(async (req, res) => {
  const data = await BookingService.getBooking(
    parseInt(req.params.id),
    req.jwtPayload.userId,
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
    req.jwtPayload.userId,
  );
  successResponse(res, { data, message: "Booking cancelled successfully." });
});

const adminCancelBooking = asyncHandler(async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const data = await BookingService.adminCancelBooking(bookingId);
  successResponse(res, {
    data,
    message: "Booking cancelled by admin (no refund).",
  });
});

module.exports = {
  createBooking,
  refundBooking,
  adminRefundBooking,
  adminCancelBooking,
  getBooking,
  getUserBookings,
  cancelBooking,
  createBookingRound
};
