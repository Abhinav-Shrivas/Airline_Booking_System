const { BookingRepository } = require("../repositories/index.js");
const { AppError, logger } = require("shared");
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
      const outboundflightSnapshot = {
        flightId,
        flightNo: flight.flightNo,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        price: flight.price,
      };
      const booking = await bookingRepository.createBookingWithPassengers(
        {
          userId,
          outboundFlightId: flightId,
          flightSnapshot: {
            outbound: outboundflightSnapshot,
            return: null,
          },
          noOfSeats,
          totalCost,
          status: "INITIATED",
        },
        passengers,
      );
      return booking;
    } catch (error) {
      // If booking creation fails, release the reserved seats
      await flightClient.incrementSeats(flightId, noOfSeats);
      throw error;
    }
  }

  //create booking for round trip
  async createBookingRound(
    userId,
    { returnFlightId, outboundFlightId, noOfSeats, passengers },
  ) {
    // 1. Validate passenger count matches seat count
    if (passengers.length !== noOfSeats) {
      throw new AppError(
        `Passenger count (${passengers.length}) must match seat count (${noOfSeats})`,
        400,
      );
    }
    // 2. Fetch flight details from FlightSearch Service
    const [outboundFlight, returnFlight] = await Promise.all([
      flightClient.getFlightById(outboundFlightId),
      flightClient.getFlightById(returnFlightId),
    ]);

    //checking round rule
    if (
      outboundFlight.arrival_airport_id !== returnFlight.departure_airport_id ||
      returnFlight.arrival_airport_id !== outboundFlight.departure_airport_id
    ) {
      throw new AppError(
        "Selected flights do not form a valid round trip.",
        400,
      );
    }
    // 3. Check seat availability
    if (outboundFlight.totalSeatsLeft < noOfSeats) {
      throw new AppError(
        `Only ${outboundFlight.totalSeatsLeft} seats available in selected outbound flight, requested ${noOfSeats}`,
        400,
      );
    }

    if (returnFlight.totalSeatsLeft < noOfSeats) {
      throw new AppError(
        `Only ${returnFlight.totalSeatsLeft} seats available in selected return flight, requested ${noOfSeats}`,
        400,
      );
    }

    // 4. Checking if return flight departs after the outbound flight reach its destination
    const outboundArrivalTime = new Date(outboundFlight.arrivalTime);
    const returnDepartureTime = new Date(returnFlight.departureTime);

    // 1 hour layover time
    if (returnDepartureTime - outboundArrivalTime < 60 * 60 * 1000) {
      throw new AppError(
        "Return flight must depart after the outbound flight arrives",
        400,
      );
    }

    // 5. Reserve seats (atomic decrement in FlightSearch)
    await flightClient.decrementSeats(outboundFlightId, noOfSeats);

    try {
      await flightClient.decrementSeats(returnFlightId, noOfSeats);
    } catch (error) {
      await flightClient.incrementSeats(outboundFlightId, noOfSeats);
      throw error;
    }

    // 6. Create booking + passengers
    try {
      const outboundSnapshot = {
        flightId: outboundFlightId,
        flightNo: outboundFlight.flightNo,
        departureTime: outboundFlight.departureTime,
        arrivalTime: outboundFlight.arrivalTime,
        price: outboundFlight.price,
      };
      const returnSnapshot = {
        flightId: returnFlightId,
        flightNo: returnFlight.flightNo,
        departureTime: returnFlight.departureTime,
        arrivalTime: returnFlight.arrivalTime,
        price: returnFlight.price,
      };
      const outboundFlightCost = outboundFlight.price;
      const returnFlightCost = returnFlight.price;
      const totalCost = (outboundFlightCost + returnFlightCost) * noOfSeats;
      const booking = await bookingRepository.createBookingWithPassengers(
        {
          userId,
          outboundFlightId,
          returnFlightId,
          tripType: "ROUND_TRIP",
          noOfSeats,
          flightSnapshot: {
            outbound: outboundSnapshot,
            return: returnSnapshot,
          },
          totalCost,
          status: "INITIATED",
        },
        passengers,
      );
      return booking;
    } catch (error) {
      // If booking creation fails, release the reserved seats
      await Promise.all([
        flightClient.incrementSeats(outboundFlightId, noOfSeats),
        flightClient.incrementSeats(returnFlightId, noOfSeats),
      ]);
      throw error;
    }
  }

  // post-payment before 24hours
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
      const timeUntilDeparture =
        new Date(booking.flightSnapshot.outbound.departureTime) - new Date();
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
    const seatReleasePromises = [
      flightClient.incrementSeats(
        booking.flightSnapshot.outbound.flightId,
        booking.noOfSeats,
      ),
    ];

    if (booking.flightSnapshot.return) {
      seatReleasePromises.push(
        flightClient.incrementSeats(
          booking.flightSnapshot.return.flightId,
          booking.noOfSeats,
        ),
      );
    }

    await Promise.all(seatReleasePromises);

    //publish event
    eventPublisher.publish("booking.refunded", {
      bookingId,
      userId: booking.userId,
      noOfSeats: booking.noOfSeats,
      refundAmount: booking.totalCost,
    });

    return booking;
  }

  //get booking by bookingId
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
  //get booking by bookingId internal route
  async getBookingByInternal(bookingId) {
    const booking = await bookingRepository.findByIdWithDetails(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    return booking;
  }

  //get booking by bookingId
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
    const seatReleasePromises = [
      flightClient.incrementSeats(
        booking.flightSnapshot.outbound.flightId,
        booking.noOfSeats,
      ),
    ];

    if (booking.flightSnapshot.return) {
      seatReleasePromises.push(
        flightClient.incrementSeats(
          booking.flightSnapshot.return.flightId,
          booking.noOfSeats,
        ),
      );
    }

    await Promise.all(seatReleasePromises);

    eventPublisher.publish("booking.cancelled", {
      bookingId,
      userId: booking.userId,
      noOfSeats: booking.noOfSeats,
    });

    return booking;
  }

  //confirm the booking
  async confirmBooking(bookingId) {
    const booking = await bookingRepository.fetch(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    booking.status = "CONFIRMED";
    booking.bookedAt = new Date();
    await booking.save();
    eventPublisher.publish("booking.confirmed", {
      bookingId,
      userId: booking.userId,
      noOfSeats: booking.noOfSeats,
      totalCost: booking.totalCost,
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
    const seatReleasePromises = [
      flightClient.incrementSeats(
        booking.flightSnapshot.outbound.flightId,
        booking.noOfSeats,
      ),
    ];

    if (booking.flightSnapshot.return) {
      seatReleasePromises.push(
        flightClient.incrementSeats(
          booking.flightSnapshot.return.flightId,
          booking.noOfSeats,
        ),
      );
    }

    await Promise.all(seatReleasePromises);

    eventPublisher.publish("booking.cancelled", {
      bookingId,
      userId: booking.userId,
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
        const flightDetails = {
          outbound: booking.flightSnapshot.outbound,
        };

        if (booking.tripType === "ROUND") {
          flightDetails.return = booking.flightSnapshot.return;
        }

        for (const [journeyType, flight] of Object.entries(flightDetails)) {
          const timeUntilDeparture =
            new Date(flight.departureTime) - new Date();

          const windowMs = hoursUntilDeparture * 60 * 60 * 1000;

          if (timeUntilDeparture > 0 && timeUntilDeparture <= windowMs) {
            upcomingBookings.push({
              bookingId: booking.id,
              userId: booking.userId,
              noOfSeats: booking.noOfSeats,
              journeyType: journeyType.toUpperCase(),
              flight,
            });
          }
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

  // Admin cancel without refund (no-show, fraud, policy violation)
  async adminCancelBooking(bookingId) {
    const booking = await bookingRepository.findByIdWithDetails(bookingId);
    if (!booking) throw new AppError("Booking not found", 404);

    if (booking.status !== "CONFIRMED") {
      throw new AppError(
        `Cannot cancel a booking with status: ${booking.status}`,
        400,
      );
    }

    booking.status = "CANCELLED";
    await booking.save();

    // Release seats back
    const seatReleasePromises = [
      flightClient.incrementSeats(
        booking.flightSnapshot.outbound.flightId,
        booking.noOfSeats,
      ),
    ];

    if (booking.flightSnapshot.return) {
      seatReleasePromises.push(
        flightClient.incrementSeats(
          booking.flightSnapshot.return.flightId,
          booking.noOfSeats,
        ),
      );
    }

    await Promise.all(seatReleasePromises);

    eventPublisher.publish("booking.cancelled_no_refund", {
      bookingId,
      userId: booking.userId,
      noOfSeats: booking.noOfSeats,
    });

    return booking;
  }
}

module.exports = new BookingService();
