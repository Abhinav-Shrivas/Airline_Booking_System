const amqp = require("amqplib");
const logger = require("./logger");

let connection, channel;


async function connectQueue(url = "amqp://localhost:5672") {
  if (channel) return channel;

  connection = await amqp.connect(url);
  channel = await connection.createChannel();

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await channel.close();
    await connection.close();
    process.exit(0);
  });

  logger.info("Connected to RabbitMQ");
  return channel;
}


async function publishMessage(ch, exchange, routingKey, message) {
  await ch.assertExchange(exchange, "topic", { durable: true });
  ch.publish(
    exchange,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }  // survive RabbitMQ restarts
  );
  logger.info(`Published [${routingKey}] to ${exchange}`);
}


async function subscribeMessage(ch, exchange, queue, bindingKey, callback) {
  await ch.assertExchange(exchange, "topic", { durable: true });
  const q = await ch.assertQueue(queue, { durable: true });
  await ch.bindQueue(q.queue, exchange, bindingKey);

  logger.info(`Subscribed to [${bindingKey}] on queue "${queue}"`);

  ch.consume(q.queue, async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        await callback(data, msg);
        ch.ack(msg);  // acknowledge — remove from queue
      } catch (error) {
        logger.error(`Error processing message: ${error.message}`);
        ch.nack(msg, false, false);  // reject — send to dead letter queue (if configured)
      }
    }
  });
}

module.exports = { connectQueue, publishMessage, subscribeMessage };
