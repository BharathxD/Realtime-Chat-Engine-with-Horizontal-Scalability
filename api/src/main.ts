import { PORT } from './config';
import createFastifyApp from './utils/createFastifyApp';
import startServer from './utils/startServer';

/**
 * Main function to start the Fastify server and define a health-check route.
 */
const main = async () => {
    const app = await createFastifyApp();
    app.get("/health-check", (_, reply) => {
        return reply.status(200).send({
            status: "OK",
            port: PORT
        });
    })
    await startServer(app);
};

main(); 
