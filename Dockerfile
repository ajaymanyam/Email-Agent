# Multi-stage Dockerfile for Intelligent Email Assistant Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm ci

# Copy backend source
COPY server/ ./
RUN npm run build || true

# Production runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY server/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

EXPOSE 5000

CMD ["node", "dist/index.js"]
