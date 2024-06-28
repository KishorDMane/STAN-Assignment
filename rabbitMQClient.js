const amqp = require('amqplib');

async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queueName = 'updateQueue';

    await channel.assertQueue(queueName, { durable: true });

    return { connection, channel };
}

async function sendMessageToQueue(channel, message) {
    const queueName = 'updateQueue';
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log('Message sent to RabbitMQ:', message);
}

async function receiveMessagesFromQueue(channel, callback) {
    const queueName = 'updateQueue';
    await channel.consume(queueName, (msg) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString());
            console.log('Received message from RabbitMQ:', message);
            callback(message);
            channel.ack(msg); // Acknowledge message processing
        }
    });
}

module.exports = {
    connectRabbitMQ,
    sendMessageToQueue,
    receiveMessagesFromQueue,
};
