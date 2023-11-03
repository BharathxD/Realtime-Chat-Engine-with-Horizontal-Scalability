import { FastifyInstance } from 'fastify';
import { HOST, PORT } from '../config';

/**
 * Start the Fastify server and listen on the specified port and host.
 *
 * @param {FastifyInstance} app - The Fastify server instance.
 * @returns {Promise<void>} A promise that resolves when the server is started successfully.
 */
const startServer = async (app: FastifyInstance): Promise<void> => {
    try {
        await app.listen({ port: PORT, host: HOST });
        console.log(`Server started at: http://${HOST}:${PORT}`);
    } catch (error) {
        console.error("Error starting the fastify server: ", error);
        process.exit(1);
    }
};

export default startServer;
