import { FastifyInstance } from 'fastify';
import { HOST, PORT } from '../config';

/**
 * Start the Fastify server and listen on the specified port and host.
 *
 * @param {FastifyInstance} server - The Fastify server instance.
 * @returns {Promise<void>} A promise that resolves when the server is started successfully.
 */
const startServer = async (server: FastifyInstance): Promise<void> => {
    try {
        await server.listen({ port: PORT, host: HOST });
        console.log(`Server started at: http://${HOST}:${PORT}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

export default startServer;
