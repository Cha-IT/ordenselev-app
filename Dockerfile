# Base image
FROM node:20-alpine AS base

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose ports (these are just documentation, docker-compose will handle mapping)
EXPOSE 5173 5100

# Default command (will be overridden by docker-compose for specific services)
CMD ["npm", "run", "dev"]
