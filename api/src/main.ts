import { PORT } from './config';
import startServer from './utils/startServer';
import createFastifyApp from './utils/createFastifyApp';

/**
 * Main function to start the Fastify server and define a health-check route.
 */
const main = async () => {
    const app = await createFastifyApp();
};

main(); 
