const { connectQueue, publishMessage, logger } = require("shared");
const { RABBITMQ_URL } = require("../config/serverConfig");

const EXCHANGE = "booking_events";
let channel;

async function init() {
  try {
    channel = await connectQueue(RABBITMQ_URL);
  } catch (error) {
    // Don't crash the service if RabbitMQ is down — degrade gracefully
    logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
  }
}

function publish(routingKey, payload) {
  if (!channel) {
    logger.warn(`RabbitMQ not connected. Skipping event: ${routingKey}`);
    return;
  }
  publishMessage(channel, EXCHANGE, routingKey, {
    ...payload,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { init, publish };
