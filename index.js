const { initializeCounter } = require('./redisClient');
const { connectRabbitMQ, sendMessageToQueue, receiveMessagesFromQueue } = require('./rabbitMQClient');
const { enqueueUpdate, processQueue } = require('./queueProcessor');
const { redis } = require('./redisClient'); // Ensure redis instance accessible for SIGINT handler

async function main() {
  try {
    console.log('Initializing counter...');
    await initializeCounter();
    console.log('Counter initialized.');

    console.log('Connecting to RabbitMQ...');
    const { channel } = await connectRabbitMQ();
    console.log('Connected to RabbitMQ.');

    console.log('Enqueuing update requests...');
    await enqueueUpdate({ action: 'increment' });
    console.log('Enqueued: { action: "increment" }');
    await enqueueUpdate({ action: 'decrement' });
    console.log('Enqueued: { action: "decrement" }');

    console.log('Starting to process the queue...');
    processQueue(); // Start processing the queue
    console.log('Queue processing started.');

    console.log('Setting up message receiving from RabbitMQ...');
    receiveMessagesFromQueue(channel, async (message) => {
      console.log('Received message from RabbitMQ:', message);
      if (message.action === 'increment') {
        await enqueueUpdate({ action: 'increment' });
        console.log('Enqueued: { action: "increment" }');
      } else if (message.action === 'decrement') {
        await enqueueUpdate({ action: 'decrement' });
        console.log('Enqueued: { action: "decrement" }');
      }
    });

    console.log('Sending example messages to RabbitMQ...');
    await sendMessageToQueue(channel, { action: 'increment' });
    console.log('Sent message to RabbitMQ: { action: "increment" }');
    // await sendMessageToQueue(channel, { action: 'decrement' });
    // console.log('Sent message to RabbitMQ: { action: "decrement" }');

    // Sending additional messages to increase the chances of race condition
    await sendMessageToQueue(channel, { action: 'increment' });
    console.log('Sent additional message to RabbitMQ: { action: "increment" }');
    // await sendMessageToQueue(channel, { action: 'decrement' });
    // console.log('Sent additional message to RabbitMQ: { action: "decrement" }');

  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main().catch(console.error);

// Handle SIGINT to close Redis connection gracefully
process.on('SIGINT', async () => {
  try {
    await redis.quit();
    console.log('Redis connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing Redis connection:', error);
    process.exit(1);
  }
});
