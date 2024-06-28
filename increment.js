// increment.js

const { connectRabbitMQ, sendMessageToQueue } = require('./rabbitMQClient');

async function sendIncrementMessages(channel) {
  try {
    console.log('Sending increment messages to RabbitMQ...');

    await sendMessageToQueue(channel, { action: 'increment 1' });
    console.log('Sent message to RabbitMQ: { action: "increment" }');

    await sendMessageToQueue(channel, { action: 'increment 1' });
    console.log('Sent another message to RabbitMQ: { action: "increment" }');

    await sendMessageToQueue(channel, { action: 'increment' });
    console.log('Sent additional message to RabbitMQ: { action: "increment 3" }');

  } catch (error) {
    console.error('Error sending increment messages:', error);
  }
}

async function main() {
  const { channel } = await connectRabbitMQ();

  await sendIncrementMessages(channel);

  // Close RabbitMQ connection
  channel.close();
}

main().catch(console.error);
