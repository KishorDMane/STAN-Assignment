const { initializeCounter } = require('./redisClient');
const { connectRabbitMQ, sendMessageToQueue, receiveMessagesFromQueue } = require('./rabbitMQClient');
const { enqueueUpdate, processQueue } = require('./queueProcessor');

async function main() {
  await initializeCounter();

  const { channel } = await connectRabbitMQ();

  // Enqueue some update requests
  await enqueueUpdate({ action: 'increment' });
  await enqueueUpdate({ action: 'decrement' });

  // Start processing the queue
  processQueue();

  // Set up RabbitMQ message receiving
  receiveMessagesFromQueue(channel, async (message) => {
    if (message.action === 'increment') {
      await enqueueUpdate({ action: 'increment' });
    } else if (message.action === 'decrement') {
      await enqueueUpdate({ action: 'decrement' });
    }
  });

  // Example of sending a message to RabbitMQ
  await sendMessageToQueue(channel, { action: 'increment' });
  await sendMessageToQueue(channel, { action: 'decrement' });


  await sendMessageToQueue(channel, { action: 'increment' });
  await sendMessageToQueue(channel, { action: 'decrement' });



  await sendMessageToQueue(channel, { action: 'increment' });
  await sendMessageToQueue(channel, { action: 'decrement' });
  
  await sendMessageToQueue(channel, { action: 'increment' });
  await sendMessageToQueue(channel, { action: 'decrement' });

  await sendMessageToQueue(channel, { action: 'increment' });
  await sendMessageToQueue(channel, { action: 'decrement' });
}

main().catch(console.error);

process.on('SIGINT', async () => {
  await redis.quit();
  console.log('Redis connection closed.');
  process.exit(0);
});
