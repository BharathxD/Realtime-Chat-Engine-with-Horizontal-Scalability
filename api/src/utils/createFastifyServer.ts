import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySocketIO from 'fastify-socket.io';

import { CORS_ORIGIN, PORT } from '../config';

/**
 * Creates and configures the Fastify server.
 */
const createFastifyServer = async () => {
    const server = fastify();
    await server.register(fastifyCors, { origin: CORS_ORIGIN });
    await server.register(fastifySocketIO);
    server.get("/health-check", (_, reply) => {
        return reply.status(200).send({
            status: "OK",
            port: PORT
        });
    })
    return server;
}

export default createFastifyServer;