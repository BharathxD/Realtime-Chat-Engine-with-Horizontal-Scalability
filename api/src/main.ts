import { config } from "dotenv";
import fastify from "fastify";

config()

const PORT = +(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
    console.error("Missing REDIS_URL");
    process.exit(1);
}

const buildServer = () => {
    const app = fastify();
    app.get("/health-check", (_, reply) => {
        return reply.status(200).send({
            status: "OK",
            port: PORT
        });
    })
    return app;
}

const main = async () => {
    const app = buildServer();

    try {
        await app.listen({ port: PORT, host: HOST });
        console.log(`Server started at: http://${HOST}:${PORT}`);
    } catch (error: unknown) {
        console.error(error);
        process.exit(1);
    }
}

main();
