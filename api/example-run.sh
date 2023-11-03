# Update the Redis URL with one of your own
# chmod +x example-run.sh
docker-compose down
export REDIS_URL=redis://default:redacted.upstash.io:43174
export CORS_ORIGIN=http://localhost:3000
docker-compose up -d --build
