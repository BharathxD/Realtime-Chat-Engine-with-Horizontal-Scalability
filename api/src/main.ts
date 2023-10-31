import createFastifyApp from './utils/createFastifyApp';

/**
 * Main function to start the Fastify server and define a health-check route.
 */
const main = async () => {
    await createFastifyApp();
};

main(); 
