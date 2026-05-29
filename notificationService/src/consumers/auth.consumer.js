const { subscribeMessage, logger } = require("shared");
const notificationService = require("../services/notification.service");

const EXCHANGE = "auth_events";
const QUEUE = "notification_queue";

async function startConsumer(channel) {
  await subscribeMessage(channel, EXCHANGE, QUEUE, "register.*", async (data, msg) => {
    const eventType = msg.fields.routingKey;
    logger.info(`Received event: ${eventType}`);
    await notificationService.handleEvent(eventType, data);
  });
  logger.info(`Consumer started — listening on queue "${QUEUE}"`);
}

module.exports = { startConsumer };
