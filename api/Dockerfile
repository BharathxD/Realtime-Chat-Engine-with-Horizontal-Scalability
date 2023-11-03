# Stage 1 - Build the base
FROM node:18-alpine AS base
WORKDIR /app
COPY src ./src
COPY package*.json /
COPY tsconfig*.json ./
RUN npm install

# Stage 2 - Build the application
FROM base as build
WORKDIR /app
RUN npm run build


# Stage 3 - Production