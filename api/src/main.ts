import fastify, { FastifyInstance } from 'fastify';
import fastifySocketIO from 'fastify-socket.io';
import { config } from 'dotenv';
import fastifyCors from '@fastify/cors';

config();

const PORT: number = +(process.env.PORT || '3001');
const HOST: string = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN: string = process.env.CORS_ORIGIN || 'http://localhost:3000';
const REDIS_URL: string | undefined = process.env.REDIS_URL;

if (!REDIS_URL) {
    console.error('Missing REDIS_URL');
    process.exit(1);
}

/**
 * Creates and configures the Fastify server.
 */
const createFastifyServer = async () => {
    const server = fastify();

    await server.register(fastifyCors, { origin: CORS_ORIGIN });
    await server.register(fastifySocketIO);

    server.get('/health-check', (_, reply) => {
        return reply.status(200).send({
            status: 'OK',
            port: PORT,
        });
    });

    return server;
};


/**
 * Start the Fastify server and listen on the specified port and host.
 */
const startServer = async () => {
    const server = await createFastifyServer();

    try {
        await server.listen({ port: PORT, host: HOST });
        console.log(`Server started at: http://${HOST}:${PORT}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

/**
 * The main entry point of the application.
 */
const main = async () => {
    await startServer();
};

main();
