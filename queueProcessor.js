const { redis, incrementCounterWithLock } = require('./redisClient');

async function enqueueUpdate(request) {
  await redis.rpush('updateQueue', JSON.stringify(request));
  console.log('Update enqueued:', request);
}

async function processQueue() {
  while (true) {
    const requestString = await redis.lpop('updateQueue');
    if (requestString) {
      const request = JSON.parse(requestString);
      console.log('Processing update:', request);
      if (request.action === 'increment') {
        await incrementCounterWithLock(); // Use locked increment function
      } else if (request.action === 'decrement') {
        // Implement decrement logic if needed
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second if queue is empty
    }
  }
}

module.exports = {
  enqueueUpdate,
  processQueue,
};
