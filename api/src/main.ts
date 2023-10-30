import createFastifyServer from './utils/createFastifyServer';
import startServer from './utils/startServer';

const main = async () => {
    const server = await createFastifyServer();
    await startServer(server);
};

main();
