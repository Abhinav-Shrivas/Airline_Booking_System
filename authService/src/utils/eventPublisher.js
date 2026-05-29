const { connectQueue, publishMessage, logger } = require("shared");
const { RABBITMQ_URL } = require("../config/serverConfig");

const EXCHANGE = "auth_events";
let channel;

async function init() {
  try {
    channel = await connectQueue(RABBITMQ_URL);
  } catch (error) {
    // Don't crash the service if RabbitMQ is down — degrade gracefully
    logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
  }
}

async function publish(routingKey, payload) {
  if (!channel) {
    logger.warn(`RabbitMQ not connected. Skipping event: ${routingKey}`);
    return;
  }
  try {
    await publishMessage(channel, EXCHANGE, routingKey, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Failed to publish event ${routingKey}:`, error);
  }
}

module.exports = { init, publish };
