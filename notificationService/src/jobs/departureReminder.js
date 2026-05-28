const cron = require("node-cron");
const { logger } = require("shared");
const bookingClient = require("../utils/bookingClient");
const notificationService = require("../services/notification.service");

// Run every hour
cron.schedule("1 * * * *", async () => {
  try {
    logger.info("Running departure reminder job...");

    const upcomingBookings = await bookingClient.getUpcomingBookings(24);

    if (upcomingBookings.length === 0) {
      logger.info("No upcoming departures found.");
      return;
    }

    logger.info(`Found ${upcomingBookings.length} upcoming departure(s). Sending reminders...`);
    await notificationService.sendDepartureReminders(upcomingBookings);
  } catch (error) {
    logger.error(`Departure reminder job failed: ${error.message}`);
  }
});
