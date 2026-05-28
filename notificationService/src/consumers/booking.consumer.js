const { subscribeMessage, logger } = require("shared");
const notificationService = require("../services/notification.service");

const EXCHANGE = "booking_events";
const QUEUE = "notification_queue";

async function startConsumer(channel) {
  // Subscribe to all booking.* events
  await subscribeMessage(channel, EXCHANGE, QUEUE, "booking.*", async (data, msg) => {
    const eventType = msg.fields.routingKey;
    logger.info(`Received event: ${eventType} — booking #${data.bookingId}`);
    await notificationService.handleEvent(eventType, data);
  });

  // Subscribe to all payment.* events
  await subscribeMessage(channel, EXCHANGE, QUEUE, "payment.*", async (data, msg) => {
    const eventType = msg.fields.routingKey;
    logger.info(`Received event: ${eventType} — booking #${data.bookingId}`);
    await notificationService.handleEvent(eventType, data);
  });

  logger.info(`Consumer started — listening on queue "${QUEUE}"`);
}

module.exports = { startConsumer };
