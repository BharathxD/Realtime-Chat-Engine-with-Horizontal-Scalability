import { FastifyInstance } from 'fastify';
import { HOST, PORT } from '../config';

/**
 * Start the Fastify server and listen on the specified port and host.
 */
const startServer = async (server: FastifyInstance) => {
    try {
        await server.listen({ port: PORT, host: HOST });
        console.log(`Server started at: http://${HOST}:${PORT}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export default startServer;