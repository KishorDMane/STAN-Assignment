const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

async function initializeCounter() {
  await redis.set('counter', 0);
  console.log('Counter initialized.');
}

async function incrementCounter() {
  const newValue = await redis.incr('counter');
  console.log('Counter incremented:', newValue);
}

async function incrementCounterWithLock() {
  const lockKey = 'counterLock';
  const acquiredLock = await redis.setnx(lockKey, 'LOCK');

  if (acquiredLock === 1) {
    try {
      const newValue = await redis.incr('counter');
      console.log('Counter incremented with lock:', newValue);
    } finally {
      await redis.del(lockKey); // Release the lock
    }
  } else {
    console.log('Failed to acquire lock. Retry or handle accordingly.');
  }
}

module.exports = {
  redis,
  initializeCounter,
  incrementCounter,
  incrementCounterWithLock,
};
