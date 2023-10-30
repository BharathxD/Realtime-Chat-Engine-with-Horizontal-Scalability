import { config } from 'dotenv';
import Redis from 'ioredis';

config();

const PORT: number = +(process.env.PORT || '3001');
const HOST: string = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN: string = process.env.CORS_ORIGIN || 'http://localhost:3000';
const REDIS_URL: string | undefined = process.env.REDIS_URL;
const CONNECTION_COUNT_CHANNEL = "chat:connection-count";


if (!REDIS_URL) {
    console.error('Missing REDIS_URL');
    process.exit(1);
}

/**
 * A redis publisher
 * ----
 * Set it `rejectUnauthorized` to `true`, if you want to encrypt the data
 * const publisher = new Redis(REDIS_URL, {
 *  tls: {
 *    rejectUnauthorized: true
 *  }
 * }
 */
const publisher = new Redis(REDIS_URL);

/**
 * A redis subscriber
 * ----
 * Set it `rejectUnauthorized` to `true`, if you want to encrypt the data
 * const subscriber = new Redis(REDIS_URL, {
 *  tls: {
 *    rejectUnauthorized: true
 *  }
 * }
 */
const subscriber = new Redis(REDIS_URL);

export {
    PORT,
    HOST,
    CORS_ORIGIN,
    REDIS_URL,
    publisher,
    subscriber
};