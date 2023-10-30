import { Redis } from 'ioredis';

const REDIS_URL: string | undefined = process.env.REDIS_URL;

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
    publisher,
    subscriber
};