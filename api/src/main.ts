import createFastifyApp from './utils/createFastifyApp';
import startServer from './utils/startServer';

const main = async () => {
    const app = await createFastifyApp();
    await startServer(app);
};

main(); 
