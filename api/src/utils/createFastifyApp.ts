import fastify from "fastify";
import fastifyCors from '@fastify/cors';
import fastifyIO from "fastify-socket.io";

import { CORS_ORIGIN, PORT } from '../config';

/**
 * Creates and configures the Fastify app.
 */
const createFastifyApp = async () => {
    const app = fastify();
    await app.register(fastifyCors, { origin: CORS_ORIGIN });
    await app.register(fastifyIO);
    app.server.on('connection', (io) => {
        console.info("Client connected.");
        io.on("end", () => {
            console.info('Client disconnected.')
        })
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