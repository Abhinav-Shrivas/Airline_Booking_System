const cron = require("node-cron");
const { logger } = require("shared");
const { BookingRepository } = require("../repositories");
const flightClient = require("../utils/flightService.client");
const eventPublisher = require("../utils/eventPublisher");

const bookingRepository = new BookingRepository();
const BOOKING_TTL_MINUTES = 10;

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    const expiredBookings =
      await bookingRepository.findExpiredBookings(BOOKING_TTL_MINUTES);

    if (expiredBookings.length === 0) return;

    logger.info(
      `Found ${expiredBookings.length} expired booking(s). Processing...`,
    );

    for (const booking of expiredBookings) {
      try {
        booking.status = "EXPIRED";
        await booking.save();

        // Release seats back to the flight
        await flightClient.incrementSeats(booking.flightId, booking.noOfSeats);
        eventPublisher.publish("booking.expired", {
          bookingId: booking.id,
          userId: booking.userId,
          flightId: booking.flightId,
          noOfSeats: booking.noOfSeats,
        });

        logger.info(
          `Expired booking #${booking.id}, released ${booking.noOfSeats} seat(s)`,
        );
      } catch (error) {
        logger.error(
          `Failed to expire booking #${booking.id}: ${error.message}`,
        );
      }
    }
  } catch (error) {
    logger.error(`Expire bookings job failed: ${error.message}`);
  }
});

logger.info("Expire bookings job scheduled (every 5 minutes)");
