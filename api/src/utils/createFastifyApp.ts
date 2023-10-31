import fastify, { FastifyInstance } from "fastify";
import fastifyCors from '@fastify/cors';
import fastifyIO from "fastify-socket.io";

import { RedisChannels, CORS_ORIGIN, PORT } from '../config';
import { publisher, subscriber } from "../config/redis";
import startServer from "./startServer";
import closeWithGrace from "close-with-grace";
import { randomUUID } from "crypto";

/**
 * Why are we maintaining the `connectedClients` variable here when there is an implementation to decrement the client count on io disconnection?
 * Well, when we save the code, the server basically restarts itself to show the changes. In that scenario, the io disconnection logic will never be
 * hit, and hence the client count stays ambiguous. The `connectedClients` variable will set the connectedClients value to `zero` every time the server
 * restarts, and we have also implemented the graceful shutdown at the end. So, even the Connected Clients KV pair in the redis will be reset.
 */
let connectedClients: number = 0;

/**
 * Creates and configures the Fastify app with real-time communication capabilities.
 * 
 * @returns {Promise<FastifyInstance>} - The configured Fastify app instance.
 */
const createFastifyApp = async (): Promise<FastifyInstance> => {
    const app = fastify({ logger: true });

    // Register the CORS plugin to enable cross-origin resource sharing.
    await app.register(fastifyCors, { origin: CORS_ORIGIN });

    // Register the Socket.IO plugin for real-time communication.
    await app.register(fastifyIO);

    // Initialize the connection count in Redis if not already set.
    let currentCount = await publisher.get(RedisChannels.CONNECTION_COUNT_KEY);
    if (!currentCount) {
        await publisher.set(RedisChannels.CONNECTION_COUNT_KEY, 0);
    }

    // Handle WebSocket connections and disconnections.
    app.io.on('connection', async (io) => {
        console.info("Client connected.");

        // Increase the connection count and notify clients.
        const incResult = await publisher.incr(RedisChannels.CONNECTION_COUNT_KEY);
        await publisher.publish(RedisChannels.CONNECTION_COUNT_UPDATED_CHANNEL, String(incResult));
        ++connectedClients;

        io.on(RedisChannels.NEW_MESSAGE_CHANNEL, async ({ message }) => {
            return await publisher.publish(RedisChannels.NEW_MESSAGE_CHANNEL, message.toString())
        })

        // Handle client disconnections.
        io.on("disconnect", async () => {
            console.info('Client disconnected.');

            // Decrease the connection count and notify clients.
            const decrResult = await publisher.decr(RedisChannels.CONNECTION_COUNT_KEY);
            await publisher.publish(RedisChannels.CONNECTION_COUNT_UPDATED_CHANNEL, String(decrResult));
            --connectedClients;
        })
    })

    // Subscribe to the connection count update channel in Redis.
    subscriber.subscribe(RedisChannels.CONNECTION_COUNT_UPDATED_CHANNEL, (err, count) => {
        if (err) {
            return console.error(`Error subscribing to ${RedisChannels.CONNECTION_COUNT_UPDATED_CHANNEL}`, err)
        };

        console.log(`${count} ${count !== 1 ? "clients" : "client"} is subscribed to ${RedisChannels.CONNECTION_COUNT_UPDATED_CHANNEL}`);
    })

    subscriber.subscribe(RedisChannels.NEW_MESSAGE_CHANNEL, (err, count) => {
        if (err) {
            return console.error(`Error subscribing to ${RedisChannels.NEW_MESSAGE_CHANNEL}`);
        }

        console.log(`${count} ${count !== 1 ? "clients" : "client"} is subscribed to ${RedisChannels.NEW_MESSAGE_CHANNEL}`);
    })

    // Handle messages received on the connection count update channel.
    subscriber.on('message', (channel, text) => {
        if (channel === RedisChannels.CONNECTION_COUNT_UPDATED_CHANNEL) {
            // Broadcast the updated connection count to all connected clients.
            return app.io.emit(RedisChannels.CONNECTION_COUNT_UPDATED_CHANNEL, {
                count: text
            });
        }
        if (channel === RedisChannels.NEW_MESSAGE_CHANNEL) {
            return app.io.emit(RedisChannels.NEW_MESSAGE_CHANNEL, {
                id: randomUUID(),
                message: text,
                createdAt: new Date(),
                port: PORT
            })
        }
    })

    app.get("/health-check", (_, reply) => {
        return reply.status(200).send({
            status: "OK",
            port: PORT
        });
    })

    closeWithGrace({ delay: 2000 }, async () => {
        if (connectedClients > 0) {
            console.log(`Removing ${connectedClients} from the count`);
            const currentCount = +(await publisher.get(RedisChannels.CONNECTION_COUNT_KEY) || '0')
            const newCount = Math.max(currentCount - connectedClients, 0);
            await publisher.set(RedisChannels.CONNECTION_COUNT_KEY, newCount)
        }
        await app.close();
    });

    // Start the server
    await startServer(app);

    return app;
}

export default createFastifyApp;
