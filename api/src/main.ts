import { config } from "dotenv";

config()

const PORT = +(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
    console.error("Missing REDIS_URL");
    process.exit(1);
}

console.log(PORT || REDIS_URL);