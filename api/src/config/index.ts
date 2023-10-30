import { config } from 'dotenv';

config();

const PORT: number = +(process.env.PORT || '3001');
const HOST: string = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN: string = process.env.CORS_ORIGIN || 'http://localhost:3000';

const REDIS_URL: string | undefined = process.env.REDIS_URL;
const CONNECTION_COUNT_KEY = "chat:connection-count";
const CONNECTION_COUND_UPDATED_CHANNEL = "chat:connection-count-updated";

if (!REDIS_URL) {
    console.error('Missing REDIS_URL');
    process.exit(1);
}

export {
    PORT,
    HOST,
    CORS_ORIGIN,
    REDIS_URL,
    CONNECTION_COUNT_KEY,
    CONNECTION_COUND_UPDATED_CHANNEL
};
