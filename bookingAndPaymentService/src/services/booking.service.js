const { BookingRepository } = require("../repositories/index.js");
const { AppError } = require("shared");
const flightClient = require("../utils/flightService.client");

const bookingRepository = new BookingRepository();

class BookingService {
  async createBooking(userId, { flightId, noOfSeats, passengers }) {
    // 1. Validate passenger count matches seat count
    if (passengers.length !== noOfSeats) {
      throw new AppError(
        `Passenger count (${passengers.length}) must match seat count (${noOfSeats})`,
        400
      );
    }

    // 2. Fetch flight details from FlightSearch Service
    const flight = await flightClient.getFlightById(flightId);

    // 3. Check seat availability
    if (flight.totalSeatsLeft < noOfSeats) {
      throw new AppError(
        `Only ${flight.totalSeatsLeft} seats available, requested ${noOfSeats}`,
        400
      );
    }

    // 4. Reserve seats (atomic decrement in FlightSearch)
    await flightClient.decrementSeats(flightId, noOfSeats);

    // 5. Create booking + passengers
    try {
      const totalCost = flight.price * noOfSeats;
      const booking = await bookingRepository.createBookingWithPassengers(
        { userId, flightId, noOfSeats, totalCost, status: "INITIATED" },
        passengers
      );
      return booking;
    } catch (error) {
      // If booking creation fails, release the reserved seats
      await flightClient.incrementSeats(flightId, noOfSeats);
      throw error;
    }
  }

  async getBooking(bookingId, userId) {
    const booking = await bookingRepository.findByIdWithDetails(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    if (booking.userId !== userId) {
      throw new AppError("You are not authorized to view this booking", 403);
    }
    return booking;
  }

  async getBookingsByUser(userId) {
    return await bookingRepository.findByUserId(userId);
  }

  async cancelBooking(bookingId, userId) {
    const booking = await bookingRepository.findByIdWithDetails(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    if (booking.userId !== userId) {
      throw new AppError("You are not authorized to cancel this booking", 403);
    }
    if (!["INITIATED", "PENDING"].includes(booking.status)) {
      throw new AppError(
        `Cannot cancel a booking with status: ${booking.status}`,
        400
      );
    }

    // Update status (the beforeUpdate hook validates the transition)
    booking.status = "CANCELLED";
    await booking.save();

    // Release seats back to the flight
    await flightClient.incrementSeats(booking.flightId, booking.noOfSeats);

    return booking;
  }

  async confirmBooking(bookingId) {
    const booking = await bookingRepository.fetch(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    booking.status = "CONFIRMED";
    booking.bookedAt = new Date();
    await booking.save();
    return booking;
  }

  async failBooking(bookingId) {
    const booking = await bookingRepository.fetch(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    booking.status = "CANCELLED";
    await booking.save();

    // Release seats
    await flightClient.incrementSeats(booking.flightId, booking.noOfSeats);
    return booking;
  }
}

module.exports = new BookingService();
