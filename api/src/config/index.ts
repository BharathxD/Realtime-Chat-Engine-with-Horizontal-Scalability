import { config } from 'dotenv';

/**
 * Load environment variables from a .env file if present.
 */
config();

/**
 * The port on which the server should listen.
 * Default is 3001 if not specified in the environment.
 * @type {number}
 */
const PORT: number = +(process.env.PORT || '3001');

/**
 * The host on which the server should bind.
 * Default is '0.0.0.0' if not specified in the environment.
 * @type {string}
 */
const HOST: string = process.env.HOST || '0.0.0.0';

/**
 * The allowed origin for CORS (Cross-Origin Resource Sharing).
 * Default is 'http://localhost:3000' if not specified in the environment.
 * @type {string}
 */
const CORS_ORIGIN: string = process.env.CORS_ORIGIN || 'http://localhost:3000';

/**
 * The URL for the Redis server.
 * @type {string | undefined}
 */
const REDIS_URL: string | undefined = process.env.REDIS_URL;

/**
 * An object to store Redis-related channel names.
 */
const RedisChannels = {
    /**
     * Key for storing the count of connections in Redis.
     */
    CONNECTION_COUNT_KEY: "chat:connection-count",
    /**
     * Channel for notifying updates to the connection count in Redis.
     */
    CONNECTION_COUNT_UPDATED_CHANNEL: "chat:connection-count-updated",
    /**
     * Channel for notifying new messages in the chat.
     */
    NEW_MESSAGE_CHANNEL: "chat:new-message",
    /**
     * Key for storing chat messages in Redis.
     */
    MESSAGES_KEY: "chat:messages",
} as const;

if (!REDIS_URL) {
    console.error('Missing REDIS_URL');
    process.exit(1);
}

export {
    PORT,
    HOST,
    CORS_ORIGIN,
    REDIS_URL,
    RedisChannels,
};
