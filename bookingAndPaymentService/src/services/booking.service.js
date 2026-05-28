const { BookingRepository } = require("../repositories/index.js");
const { AppError } = require("shared");
const { sequelize } = require("../models");
const flightClient = require("../utils/flightService.client");
const paymentService = require("./payment.service.js");
const eventPublisher = require("../utils/eventPublisher");
const bookingRepository = new BookingRepository();

class BookingService {
  async createBooking(userId, { flightId, noOfSeats, passengers }) {
    // 1. Validate passenger count matches seat count
    if (passengers.length !== noOfSeats) {
      throw new AppError(
        `Passenger count (${passengers.length}) must match seat count (${noOfSeats})`,
        400,
      );
    }

    // 2. Fetch flight details from FlightSearch Service
    const flight = await flightClient.getFlightById(flightId);

    // 3. Check seat availability
    if (flight.totalSeatsLeft < noOfSeats) {
      throw new AppError(
        `Only ${flight.totalSeatsLeft} seats available, requested ${noOfSeats}`,
        400,
      );
    }

    // 4. Reserve seats (atomic decrement in FlightSearch)
    await flightClient.decrementSeats(flightId, noOfSeats);

    // 5. Create booking + passengers
    try {
      const totalCost = flight.price * noOfSeats;
      const booking = await bookingRepository.createBookingWithPassengers(
        { userId, flightId, noOfSeats, totalCost, status: "INITIATED" },
        passengers,
      );
      return booking;
    } catch (error) {
      // If booking creation fails, release the reserved seats
      await flightClient.incrementSeats(flightId, noOfSeats);
      throw error;
    }
  }

  async cancelAndRefundBooking(bookingId, userId, options = {}) {
    const { skipTimeCheck = false, skipOwnershipCheck = false } = options;

    // Fetch booking — with or without ownership check
    const booking = skipOwnershipCheck
      ? await bookingRepository.findByIdWithDetails(bookingId)
      : await this.getBooking(bookingId, userId);

    if (!booking) throw new AppError("Booking not found", 404);

    if (booking.status !== "CONFIRMED") {
      throw new AppError(
        `Cannot refund a booking with status: ${booking.status}`,
        400,
      );
    }

    // Enforce 24-hour rule unless skipped (admin override)
    if (!skipTimeCheck) {
      const flight = await flightClient.getFlightById(booking.flightId);
      const timeUntilDeparture = new Date(flight.departureTime) - new Date();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (timeUntilDeparture < oneDayMs) {
        throw new AppError("Cannot cancel within 24 hours of departure.", 400);
      }
    }

    // 1. Process refund via payment gateway (external call — before any DB changes)
    const payment = await paymentService.processGatewayRefund(
      bookingId,
      booking.userId,
    );

    // 2. Commit all DB changes atomically
    await sequelize.transaction(async (t) => {
      booking.status = "CANCELLED";
      await booking.save({ transaction: t });

      await paymentService.markPaymentRefunded(payment, { transaction: t });
    });

    // 3. Release seats back (best-effort)
    await flightClient.incrementSeats(booking.flightId, booking.noOfSeats);
    eventPublisher.publish("booking.refunded", {
      bookingId,
      userId: booking.userId,
      flightId: booking.flightId,
      noOfSeats: booking.noOfSeats,
      refundAmount: booking.totalCost,
    });

    return booking;
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

  //User-initiated, pre-payment
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
        400,
      );
    }

    // Update status (the beforeUpdate hook validates the transition)
    booking.status = "CANCELLED";
    await booking.save();

    // Release seats back to the flight
    await flightClient.incrementSeats(booking.flightId, booking.noOfSeats);
    eventPublisher.publish("booking.cancelled", {
      bookingId,
      userId: booking.userId,
      flightId: booking.flightId,
      noOfSeats: booking.noOfSeats,
    });

    return booking;
  }

  async confirmBooking(bookingId) {
    const booking = await bookingRepository.fetch(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    booking.status = "CONFIRMED";
    booking.bookedAt = new Date();
    await booking.save();
    eventPublisher.publish("booking.confirmed", {
      bookingId,
      userId: booking.userId,
      flightId: booking.flightId,
      noOfSeats: booking.noOfSeats,
      totalCost: booking.totalCost,
      bookedAt: booking.bookedAt,
    });
    return booking;
  }

  //System-initiated, payment failure
  async failBooking(bookingId) {
    const booking = await bookingRepository.fetch(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    booking.status = "CANCELLED";
    await booking.save();

    // Release seats
    await flightClient.incrementSeats(booking.flightId, booking.noOfSeats);
    eventPublisher.publish("booking.cancelled", {
      bookingId,
      userId: booking.userId,
      flightId: booking.flightId,
      noOfSeats: booking.noOfSeats,
    });
    return booking;
  }

  async getUpcomingBookings(hoursUntilDeparture = 24) {
    // 1. Get all CONFIRMED bookings
    const confirmedBookings = await bookingRepository.findConfirmedBookings();

    // 2. For each, check if the flight departs within the time window
    const upcomingBookings = [];
    for (const booking of confirmedBookings) {
      try {
        const flight = await flightClient.getFlightById(booking.flightId);
        const timeUntilDeparture = new Date(flight.departureTime) - new Date();
        const windowMs = hoursUntilDeparture * 60 * 60 * 1000;

        if (timeUntilDeparture > 0 && timeUntilDeparture <= windowMs) {
          upcomingBookings.push({
            bookingId: booking.id,
            userId: booking.userId,
            flightId: booking.flightId,
            noOfSeats: booking.noOfSeats,
            flight: {
              flightNo: flight.flightNo,
              departureTime: flight.departureTime,
              arrivalTime: flight.arrivalTime,
            },
          });
        }
      } catch (error) {
        logger.error(
          `Failed to fetch flight for booking #${booking.id}: ${error.message}`,
        );
        continue;
      }
    }
    return upcomingBookings;
  }
}

module.exports = new BookingService();
