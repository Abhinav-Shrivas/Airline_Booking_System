const BookingService = require("../services/booking.service");
const { asyncHandler, successResponse } = require("shared");

const getUpcomingBookings = asyncHandler(async (req, res) => {
  const hours = parseInt(req.query.hoursUntilDeparture) || 24;
  const data = await BookingService.getUpcomingBookings(hours);
  successResponse(res, { data, message: "Upcoming bookings fetched." });
});

const getBooking = asyncHandler(async (req, res) => {
  const data = await BookingService.getBookingByInternal(
    parseInt(req.params.id)
  );
  successResponse(res, { data, message: "Booking fetched successfully." });
});

module.exports = { getUpcomingBookings, getBooking };
