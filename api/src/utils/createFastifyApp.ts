import fastify, { FastifyInstance } from "fastify";
import fastifyCors from '@fastify/cors';
import fastifyIO from "fastify-socket.io";

import { CONNECTION_COUNT_UPDATED_CHANNEL, CONNECTION_COUNT_KEY, CORS_ORIGIN, PORT } from '../config';
import { publisher, subscriber } from "../config/redis";
import startServer from "./startServer";
import closeWithGrace from "close-with-grace";

let connectedClients = 0;

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
    let currentCount = await publisher.get(CONNECTION_COUNT_KEY);
    if (!currentCount) {
        await publisher.set(CONNECTION_COUNT_KEY, 0);
    }

    // Handle WebSocket connections and disconnections.
    app.io.on('connection', async (io) => {
        console.info("Client connected.");

        // Increase the connection count and notify clients.
        const incResult = await publisher.incr(CONNECTION_COUNT_KEY);
        await publisher.publish(CONNECTION_COUNT_UPDATED_CHANNEL, String(incResult));
        ++connectedClients;

        // Handle client disconnections.
        io.on("disconnect", async () => {
            console.info('Client disconnected.');

            // Decrease the connection count and notify clients.
            const decrResult = await publisher.decr(CONNECTION_COUNT_KEY);
            await publisher.publish(CONNECTION_COUNT_UPDATED_CHANNEL, String(decrResult));
            --connectedClients;
        })
    })

    // Subscribe to the connection count update channel in Redis.
    subscriber.subscribe(CONNECTION_COUNT_UPDATED_CHANNEL, (err, count) => {
        if (err) return console.error(`Error subscribing to ${CONNECTION_COUNT_UPDATED_CHANNEL}`, err);

        console.log(`${count} ${count !== 1 ? "clients" : "client"} is connected to ${CONNECTION_COUNT_UPDATED_CHANNEL}`);
    })

    // Handle messages received on the connection count update channel.
    subscriber.on('message', (channel, text) => {
        if (channel === CONNECTION_COUNT_UPDATED_CHANNEL) {
            // Broadcast the updated connection count to all connected clients.
            app.io.emit(CONNECTION_COUNT_UPDATED_CHANNEL, {
                count: text
            });
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
            const currentCount = +(await publisher.get(CONNECTION_COUNT_KEY) || '0')
            const newCount = Math.max(currentCount - connectedClients, 0);
            await publisher.set(CONNECTION_COUNT_KEY, newCount)
        }
        await app.close();
    });

    // Start the server
    await startServer(app);

    return app;
}

export default createFastifyApp;
