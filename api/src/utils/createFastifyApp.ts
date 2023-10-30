import fastify from "fastify";
import fastifyCors from '@fastify/cors';
import fastifyIO from "fastify-socket.io";

import { CONNECTION_COUNT_UPDATED_CHANNEL, CONNECTION_COUNT_KEY, CORS_ORIGIN, PORT } from '../config';
import { publisher, subscriber } from "../config/redis";

/**
 * Creates and configures the Fastify app.
 */
const createFastifyApp = async () => {
    const app = fastify();
    const io = app.server;
    await app.register(fastifyCors, { origin: CORS_ORIGIN });
    await app.register(fastifyIO);
    let currentCount = await publisher.get(CONNECTION_COUNT_KEY);
    if (!currentCount) {
        // If there is no connection count set, it should be initialized with 0
        await publisher.set(CONNECTION_COUNT_KEY, 0);
    }
    io.on('connection', async (io) => {
        console.info("Client connected.");
        const incResult = await publisher.incr(CONNECTION_COUNT_KEY);
        await publisher.publish(CONNECTION_COUNT_UPDATED_CHANNEL, String(incResult));
        io.on("end", async () => {
            console.info('Client disconnected.');
            const decrResult = await publisher.decr(CONNECTION_COUNT_KEY);
            await publisher.publish(CONNECTION_COUNT_UPDATED_CHANNEL, String(decrResult))
        })
    })
    subscriber.subscribe(CONNECTION_COUNT_UPDATED_CHANNEL, (err, count) => {
        if (err) return console.error(`Error subscribing to ${CONNECTION_COUNT_UPDATED_CHANNEL}`, err);
        console.log(`${count} ${count !== 1 ? "clients" : "client"} is connected to ${CONNECTION_COUNT_UPDATED_CHANNEL}`)
    })
    subscriber.on('message', (channel, text) => {
        if (channel === CONNECTION_COUNT_UPDATED_CHANNEL) {
            io.emit(CONNECTION_COUNT_UPDATED_CHANNEL, {
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
    return app;
}

export default createFastifyApp;